const Minio = require('minio');
require('dotenv').config();

let minioClient = null;

if (process.env.USE_MINIO === 'true') {
  minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'password123'
  });

  const bucketName = process.env.MINIO_BUCKET_NAME || 'icuman';

  // Ensure bucket exists
  minioClient.bucketExists(bucketName, function(err, exists) {
    if (err) {
      console.log('Error checking MinIO bucket existence:', err);
    }
    if (!exists) {
      minioClient.makeBucket(bucketName, '', function(err) {
        if (err) {
          console.log('Error creating MinIO bucket:', err);
        } else {
          console.log(`✅ MinIO Bucket '${bucketName}' created successfully.`);
        }
      });
    } else {
      console.log(`✅ MinIO Bucket '${bucketName}' is ready.`);
    }
  });
}

module.exports = minioClient;
