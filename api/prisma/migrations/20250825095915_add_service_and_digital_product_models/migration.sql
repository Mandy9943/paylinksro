-- CreateTable
CREATE TABLE "ServiceItem" (
    "id" TEXT NOT NULL,
    "payLinkId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalProduct" (
    "id" TEXT NOT NULL,
    "payLinkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assets" JSONB,
    "coverImageUrl" TEXT,

    CONSTRAINT "DigitalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceItem_payLinkId_key" ON "ServiceItem"("payLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalProduct_payLinkId_key" ON "DigitalProduct"("payLinkId");

-- AddForeignKey
ALTER TABLE "ServiceItem" ADD CONSTRAINT "ServiceItem_payLinkId_fkey" FOREIGN KEY ("payLinkId") REFERENCES "PayLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalProduct" ADD CONSTRAINT "DigitalProduct_payLinkId_fkey" FOREIGN KEY ("payLinkId") REFERENCES "PayLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
