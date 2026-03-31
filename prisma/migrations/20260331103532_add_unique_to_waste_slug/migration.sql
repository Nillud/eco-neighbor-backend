/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Waste` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Waste_slug_key" ON "Waste"("slug");
