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

export async function getProductsForBundle() {
  try {
    const products = await prisma.product.findMany({
      where: { productType: { not: 'BUNDLE' } },
      select: {
        id: true,
        name: true,
        price: true,
        images: {
          take: 1,
          select: { url: true }
        }
      }
    });
    return products;
  } catch (error) {
    console.error('Failed to get products:', error);
    return [];
  }
}

export async function createBundle(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (!name) return { errors: { name: ['Bundle name is required'] } };

    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const compareAtPrice = formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : null;
    const status = formData.get('status') as string || 'DRAFT';

    const bundleItemsStr = formData.get('bundleItems') as string;
    let bundleItems: string[] = [];
    if (bundleItemsStr) {
      try {
        bundleItems = JSON.parse(bundleItemsStr);
      } catch (e) {}
    }

    const bundle = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        compareAtPrice,
        status,
        productType: 'BUNDLE',
        isPublished: status === 'PUBLISHED',
      }
    });

    if (bundleItems.length > 0) {
      await prisma.productRelation.createMany({
        data: bundleItems.map((id) => ({
          productId: bundle.id,
          relatedProductId: id,
          type: 'BUNDLE_ITEM'
        }))
      });
    }

    const images = formData.getAll('images') as File[];
    const validImages = images.filter(file => file.size > 0);
    if (validImages.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      
      const imageRecords = [];
      for (let i = 0; i < validImages.length; i++) {
        const file = validImages[i];
        const ext = path.extname(file.name);
        const fileName = `${randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        imageRecords.push({ productId: bundle.id, url: `/uploads/${fileName}`, position: i });
      }
      await prisma.productImage.createMany({ data: imageRecords });
    }

    revalidatePath('/admin/collections');
    revalidatePath('/(storefront)/collections', 'page');
    return { success: true, message: 'Bundle created successfully!' };
  } catch (error) {
    console.error('Failed to create bundle:', error);
    return { message: 'Failed to create bundle. Check logs.' };
  }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (!name) return { errors: { name: ['Product name is required'] } };

    const shortDescription = formData.get('shortDescription') as string;
    const description = formData.get('description') as string;
    const brand = formData.get('brand') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const stock = parseInt(formData.get('stock') as string) || 0;
    const status = formData.get('status') as string || 'DRAFT';
    const featured = formData.get('featured') === 'on';

    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        shortDescription,
        description,
        brand,
        price,
        stock,
        status,
        featured,
        isPublished: status === 'PUBLISHED',
      }
    });

    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    revalidatePath('/(storefront)/shop', 'page');
    revalidatePath(`/(storefront)/products/${slug}`);
    
    return { success: true, message: 'Product updated successfully!' };
  } catch (error) {
    console.error('Failed to update product:', error);
    return { message: 'Failed to update product. Check logs.' };
  }
}

export async function updateStock(productId: string, stock: number) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { stock }
    });
    revalidatePath('/admin/products');
    revalidatePath('/admin/inventory');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to update stock' };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, order };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { error: error.message || 'Failed to update order status' };
  }
}
