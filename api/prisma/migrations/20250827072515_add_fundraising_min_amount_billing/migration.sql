-- AlterEnum
ALTER TYPE "ServiceType" ADD VALUE 'FUNDRAISING';

-- AlterTable
ALTER TABLE "PayLink" ADD COLUMN     "collectBillingAddress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minAmount" INTEGER;

-- CreateTable
CREATE TABLE "FundraisingCampaign" (
    "id" TEXT NOT NULL,
    "payLinkId" TEXT NOT NULL,
    "targetAmount" INTEGER,
    "currentRaised" INTEGER DEFAULT 0,
    "coverImageUrl" TEXT,

    CONSTRAINT "FundraisingCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FundraisingCampaign_payLinkId_key" ON "FundraisingCampaign"("payLinkId");

-- AddForeignKey
ALTER TABLE "FundraisingCampaign" ADD CONSTRAINT "FundraisingCampaign_payLinkId_fkey" FOREIGN KEY ("payLinkId") REFERENCES "PayLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
