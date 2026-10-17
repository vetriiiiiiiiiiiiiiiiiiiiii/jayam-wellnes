-- CreateEnum
CREATE TYPE "Carrier" AS ENUM ('USPS', 'UPS');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "razorpayOrderId",
DROP COLUMN "razorpayPaymentId",
ADD COLUMN     "accessToken" TEXT NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text),
ADD COLUMN     "carrier" "Carrier",
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "stripePaymentIntentId" TEXT,
ALTER COLUMN "paymentMethod" SET DEFAULT 'STRIPE';

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_accessToken_key" ON "Order"("accessToken");

