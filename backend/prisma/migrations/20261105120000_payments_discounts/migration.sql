-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountCode" TEXT,
ADD COLUMN     "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL DEFAULT 'PERCENT',
    "value" DOUBLE PRECISION NOT NULL,
    "minSubtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");
