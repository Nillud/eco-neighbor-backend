/*
  Warnings:

  - Made the column `slug` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
