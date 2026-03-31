-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'FINISHED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING';
