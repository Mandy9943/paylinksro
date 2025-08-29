/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `PayLink` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PayLink_userId_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "PayLink_slug_key" ON "PayLink"("slug");
