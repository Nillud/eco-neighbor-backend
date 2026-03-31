/*
  Warnings:

  - A unique constraint covering the columns `[userId,achievement_id]` on the table `UserAchievement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirement_count` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "requirement_count" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserAchievement" ADD COLUMN     "current_value" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inUlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievement_id_key" ON "UserAchievement"("userId", "achievement_id");
