const { Worker } = require("bullmq");
const prisma = require("../config/prisma");
const { connection } = require("../services/queue");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const minio = require("../config/minio");

sharp.cache(false);

const BUCKET = process.env.MINIO_BUCKET_NAME;

// Prisma delegate for each model name used in job data
const delegates = {
  Product: prisma.product,
  User: prisma.user,
  Gallery: prisma.gallery,
  Banner: prisma.banner,
};

// Add an uploaded file to a list field (only Product.images is a list)
const pushMedia = async (modelName, fieldName, fileId, storedPath) => {
  if (modelName === "Product" && fieldName === "images") {
    const position = await prisma.productImage.count({ where: { productId: fileId } });
    await prisma.productImage.create({ data: { productId: fileId, url: storedPath, position } });
    return;
  }
  throw new Error(`Unsupported push target ${modelName}.${fieldName}`);
};

// Replace a single-file field (e.g. User.profilePicture, Gallery.imageUrl)
const setMedia = async (modelName, fieldName, fileId, storedPath) => {
  const data = { [fieldName]: storedPath };
  if (modelName === "Gallery") data.status = "completed";
  await delegates[modelName].update({ where: { id: fileId }, data });
};

const worker = new Worker(
  "media-processing",
  async (job) => {
    const {
      fileId,
      filePath,
      mimeType,
      outputDir,
      modelName,
      fieldName,
      operation,
    } = job.data;

    console.log(`\n[Worker] 🟢 JOB START`);
    console.log(`[Worker] Model: ${modelName}`);
    console.log(`[Worker] File ID: ${fileId}`);
    console.log(`[Worker] File Path: ${filePath}`);
    console.log(`[Worker] Output Dir: ${outputDir}`);
    console.log(`[Worker] Bucket: ${BUCKET}`);

    // ---------- STEP 1: Resolve input ----------
    let absoluteInputPath = path.resolve(filePath);

    if (!fs.existsSync(absoluteInputPath)) {
      const fallback = path.join(process.cwd(), "Backend", filePath);
      if (fs.existsSync(fallback)) absoluteInputPath = fallback;
    }

    console.log(`[Worker][STEP 1] Input resolved to: ${absoluteInputPath}`);

    if (!fs.existsSync(absoluteInputPath)) {
      throw new Error(`Input file missing: ${absoluteInputPath}`);
    }

    // ---------- STEP 2: Prepare temp dir ----------
    const tempDir = path.resolve(outputDir);
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`[Worker][STEP 2] Temp dir ready: ${tempDir}`);

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const finalFilename = `${modelName.toLowerCase()}-${fileId}-${timestamp}-${randomStr}.webp`;
    const tempOutput = path.join(tempDir, finalFilename);

    try {
      // ---------- STEP 3: Sharp processing ----------
      console.log(`[Worker][STEP 3] Sharp start`);

      let pipeline = sharp(absoluteInputPath);

      if (modelName === "User") {
        pipeline = pipeline.resize(500, 500, { fit: "cover" });
      } else if (modelName === "Product") {
        pipeline = pipeline.resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        });
      } else if (modelName === "Gallery") {
        pipeline = pipeline.resize(1920, 1080, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      await pipeline.webp({ quality: 80 }).toFile(tempOutput);

      console.log(`[Worker][STEP 3] Sharp done → ${tempOutput}`);

      if (!fs.existsSync(tempOutput) || fs.statSync(tempOutput).size === 0) {
        throw new Error("Sharp output invalid");
      }

      let storedPath = "";

      if (process.env.USE_MINIO === "true") {
        // ---------- STEP 4: Upload to MinIO ----------
        const objectKey = `${modelName.toLowerCase()}/${finalFilename}`;
        console.log(`[Worker][STEP 4] Uploading to MinIO`);
        
        await minio.fPutObject(BUCKET, objectKey, tempOutput, {
          "Content-Type": "image/webp",
        });
        console.log(`[Worker][STEP 4] MinIO upload DONE`);
        storedPath = `/${objectKey}`;

        // DB update (MinIO)
        if (operation === "push") {
          await pushMedia(modelName, fieldName, fileId, storedPath);
        } else {
          const doc = await delegates[modelName].findUnique({ where: { id: fileId } });
          if (doc && doc[fieldName]) {
            const oldPath = doc[fieldName];
            // Assuming storedPath is /bucket/objectKey
            const bucketPrefix = `/${process.env.MINIO_BUCKET_NAME || 'icuman'}/`;
            if (oldPath.startsWith(bucketPrefix)) {
              const oldKey = oldPath.slice(bucketPrefix.length);
              try { await minio.removeObject(BUCKET, oldKey); } catch (e) {}
            }
          }
          await setMedia(modelName, fieldName, fileId, storedPath);
        }

      } else {
        // Local fallback
        storedPath = `/uploads/${modelName.toLowerCase()}/${finalFilename}`;
        const finalDest = path.join(process.cwd(), "public", storedPath);
        fs.mkdirSync(path.dirname(finalDest), { recursive: true });
        fs.copyFileSync(tempOutput, finalDest);

        if (operation === "push") {
          await pushMedia(modelName, fieldName, fileId, storedPath);
        } else {
          await setMedia(modelName, fieldName, fileId, storedPath);
        }
      }

      // ---------- STEP 6: Cleanup ----------
      console.log(`[Worker][STEP 6] Cleanup start`);
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
      if (fs.existsSync(absoluteInputPath)) fs.unlinkSync(absoluteInputPath);

      console.log(`[Worker] 🎉 JOB COMPLETED SUCCESSFULLY`);
      console.log(`[Worker] Final Path: ${storedPath}\n`);

      return storedPath;
    } catch (err) {
      console.error(`[Worker ❌ ERROR] ${err.message}`);

      if (fs.existsSync(tempOutput)) {
        try {
          fs.unlinkSync(tempOutput);
        } catch {}
      }

      throw err;
    }
  },
  {
    connection,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  }
);

console.log("🧵 Media Worker started (MinIO + DEBUG)");
