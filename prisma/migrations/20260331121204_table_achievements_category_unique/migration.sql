/*
  Warnings:

  - A unique constraint covering the columns `[category]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Achievement_category_key" ON "Achievement"("category");
