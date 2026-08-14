'use server';

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitReview(productId: string, formData: FormData) {
  const content = formData.get('content') as string;
  const title = formData.get('title') as string;
  const rating = Number(formData.get('rating') || 5);
  const author = formData.get('author') as string || 'Guest';

  if (!content || !productId) {
    return { error: 'Review content is required.' };
  }

  try {
    await db.review.create({
      data: {
        productId,
        title: title || `${rating} Star Review`,
        content,
        rating,
        isPublished: true, // Auto-publish for now
        isVerified: false,
      }
    });

    revalidatePath(`/products/[slug]`, 'page');
    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { error: 'Failed to submit review.' };
  }
}
