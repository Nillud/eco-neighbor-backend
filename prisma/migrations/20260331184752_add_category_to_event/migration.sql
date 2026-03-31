-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('CLEANUP', 'WORKSHOP', 'EXCHANGE', 'OTHER');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" "EventCategory" NOT NULL DEFAULT 'CLEANUP';
