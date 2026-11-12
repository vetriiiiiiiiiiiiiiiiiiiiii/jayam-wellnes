-- AlterTable
ALTER TABLE "DiscountCode" ADD COLUMN     "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "offer" JSONB;
