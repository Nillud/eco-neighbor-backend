-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('CONTAINER', 'POINT');

-- AlterTable
ALTER TABLE "MapPoint" ADD COLUMN     "type" "PointType" NOT NULL DEFAULT 'CONTAINER';
