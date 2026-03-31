/*
  Warnings:

  - You are about to drop the column `inUlocked` on the `UserAchievement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserAchievement" DROP COLUMN "inUlocked",
ADD COLUMN     "isUlocked" BOOLEAN NOT NULL DEFAULT false;
