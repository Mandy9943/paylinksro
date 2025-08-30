-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "appFeeFixed" INTEGER,
ADD COLUMN     "appFeeMonthly" INTEGER,
ADD COLUMN     "appFeePercent" INTEGER;

-- CreateTable
CREATE TABLE "MonthlyFeeAccrual" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "collected" INTEGER NOT NULL DEFAULT 0,
    "lastTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyFeeAccrual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyFeeAccrual_userId_month_idx" ON "MonthlyFeeAccrual"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFeeAccrual_userId_month_key" ON "MonthlyFeeAccrual"("userId", "month");

-- AddForeignKey
ALTER TABLE "MonthlyFeeAccrual" ADD CONSTRAINT "MonthlyFeeAccrual_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
