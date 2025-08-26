-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SERVICE', 'DIGITAL_PRODUCT', 'DONATION');

-- CreateTable
CREATE TABLE "PayLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priceType" "PriceType" NOT NULL,
    "amount" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'RON',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "serviceType" "ServiceType" NOT NULL DEFAULT 'SERVICE',
    "description" TEXT,
    "collectEmail" BOOLEAN NOT NULL DEFAULT true,
    "collectPhone" BOOLEAN NOT NULL DEFAULT false,
    "mainColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayLink_userId_createdAt_idx" ON "PayLink"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PayLink_userId_slug_key" ON "PayLink"("userId", "slug");

-- AddForeignKey
ALTER TABLE "PayLink" ADD CONSTRAINT "PayLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
