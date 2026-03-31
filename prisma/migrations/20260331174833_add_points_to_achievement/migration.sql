/*
  Warnings:

  - Added the required column `points` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "points" INTEGER NOT NULL,
ALTER COLUMN "requirement_count" SET DATA TYPE DOUBLE PRECISION;
