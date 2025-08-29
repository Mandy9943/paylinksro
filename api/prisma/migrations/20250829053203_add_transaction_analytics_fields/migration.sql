-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "disputedAt" TIMESTAMP(3),
ADD COLUMN     "netAmount" INTEGER,
ADD COLUMN     "stripeDisputeId" TEXT,
ADD COLUMN     "succeededAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "active" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "Transaction_userId_succeededAt_idx" ON "Transaction"("userId", "succeededAt");
