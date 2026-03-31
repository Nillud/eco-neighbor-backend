/*
  Warnings:

  - You are about to drop the column `isUlocked` on the `UserAchievement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Achievement_category_key";

-- AlterTable
ALTER TABLE "MapPoint" ADD COLUMN     "author_id" TEXT;

-- AlterTable
ALTER TABLE "UserAchievement" DROP COLUMN "isUlocked",
ADD COLUMN     "is_unlocked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "earned_at" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_title_key" ON "Achievement"("title");

-- AddForeignKey
ALTER TABLE "MapPoint" ADD CONSTRAINT "MapPoint_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
