'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function createProduct(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (!name) {
      return { errors: { name: ['Product name is required'] } };
    }

    // Basic Info
    const shortDescription = formData.get('shortDescription') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const brand = formData.get('brand') as string;
    const tags = formData.get('tags') as string;
    
    const featured = formData.get('featured') === 'on';
    const isBestSeller = formData.get('isBestSeller') === 'on';
    const isNew = formData.get('isNew') === 'on';
    const status = formData.get('status') as string || 'DRAFT';

    // Pricing
    const price = parseFloat(formData.get('price') as string) || 0;
    const compareAtPrice = formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : null;
    const costPrice = formData.get('costPrice') ? parseFloat(formData.get('costPrice') as string) : null;
    const taxRate = formData.get('taxRate') ? parseFloat(formData.get('taxRate') as string) : null;
    const taxInclusive = formData.get('taxInclusive') === 'on';

    // Inventory
    const sku = formData.get('sku') as string;
    const barcode = formData.get('barcode') as string;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string) || 5;
    const batchNumber = formData.get('batchNumber') as string;
    const warehouse = formData.get('warehouse') as string;
    
    const mfgStr = formData.get('manufacturingDate') as string;
    const expStr = formData.get('expiryDate') as string;
    const manufacturingDate = mfgStr ? new Date(mfgStr) : null;
    const expiryDate = expStr ? new Date(expStr) : null;

    // SEO
    const seoTitle = formData.get('seoTitle') as string;
    const seoDescription = formData.get('seoDescription') as string;
    const focusKeywords = formData.get('focusKeywords') as string;
    const canonicalUrl = formData.get('canonicalUrl') as string;

    // Build the primary product record
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription,
        description,
        brand,
        categoryId: categoryId || null,
        tags,
        featured,
        isBestSeller,
        isNew,
        status,
        isPublished: status === 'PUBLISHED',
        
        price,
        compareAtPrice,
        costPrice,
        taxRate,
        taxInclusive,

        sku,
        barcode,
        stock,
        lowStockThreshold,
        batchNumber,
        warehouse,
        manufacturingDate,
        expiryDate,

        seoTitle,
        seoDescription,
        focusKeywords,
        canonicalUrl
      }
    });

    // Handle Image Uploads
    const images = formData.getAll('images') as File[];
    const validImages = images.filter(file => file.size > 0);
    
    if (validImages.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const imageRecords = [];
      for (let i = 0; i < validImages.length; i++) {
        const file = validImages[i];
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
        const ext = file.name.split('.').pop();
        const filename = `${uniqueSuffix}.${ext}`;
        const filepath = path.join(uploadDir, filename);
        
        fs.writeFileSync(filepath, buffer);
        
        imageRecords.push({
          productId: product.id,
          url: `/uploads/${filename}`,
          position: i,
          altText: `${name} - Image ${i + 1}`
        });
      }

      if (imageRecords.length > 0) {
        await prisma.productImage.createMany({
          data: imageRecords
        });
      }
    }

    // Handle JSON data (Specs, Nutrition, Certs, Benefits, Ingredients)
    
    // Ingredients
    const ingredients = formData.get('ingredients') as string;
    const allergens = formData.get('allergens') as string;
    const preservatives = formData.get('preservatives') as string;
    
    if (ingredients || allergens || preservatives) {
      await prisma.productIngredient.create({
        data: {
          productId: product.id,
          ingredients,
          allergens,
          preservatives
        }
      });
    }

    // Nutrition
    const nServing = formData.get('nutr_servingSize') as string;
    const nEnergy = formData.get('nutr_energy') as string;
    const nProtein = formData.get('nutr_protein') as string;
    const nCarbs = formData.get('nutr_carbohydrates') as string;
    const nFat = formData.get('nutr_totalFat') as string;
    const nFibre = formData.get('nutr_dietaryFibre') as string;

    if (nServing || nEnergy || nProtein || nCarbs || nFat || nFibre) {
      await prisma.productNutrition.create({
        data: {
          productId: product.id,
          servingSize: nServing,
          energy: nEnergy,
          protein: nProtein,
          carbohydrates: nCarbs,
          totalFat: nFat,
          dietaryFibre: nFibre
        }
      });
    }

    // Custom Specs JSON
    const specsStr = formData.get('specifications') as string;
    if (specsStr) {
      try {
        const specs = JSON.parse(specsStr);
        if (Array.isArray(specs)) {
          await prisma.productSpecification.createMany({
            data: specs.map((s: any) => ({
              productId: product.id,
              name: s.name,
              value: s.value
            }))
          });
        }
      } catch(e) {}
    }

    // Benefits JSON
    const benefitsStr = formData.get('benefits') as string;
    if (benefitsStr) {
      try {
        const benefits = JSON.parse(benefitsStr);
        if (Array.isArray(benefits)) {
          await prisma.productBenefit.createMany({
            data: benefits.map((b: any, i: number) => ({
              productId: product.id,
              title: b.title,
              description: b.description,
              position: i
            }))
          });
        }
      } catch(e) {}
    }

    revalidatePath('/admin/products');
    revalidatePath('/(storefront)/shop', 'page');
    
    return { success: true, message: 'Product created successfully!' };
  } catch (error) {
    console.error('Failed to create product:', error);
    return { message: 'Failed to create product. Check logs.' };
  }
}
