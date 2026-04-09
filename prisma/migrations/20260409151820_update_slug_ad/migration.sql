/*
  Warnings:

  - Made the column `slug` on table `Ad` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ad" ALTER COLUMN "slug" SET NOT NULL;
