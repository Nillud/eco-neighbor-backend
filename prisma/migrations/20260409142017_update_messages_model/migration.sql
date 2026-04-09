/*
  Warnings:

  - You are about to drop the column `adId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `sender_id` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_adId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropIndex
DROP INDEX "Message_adId_idx";

-- DropIndex
DROP INDEX "Message_eventId_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "adId",
DROP COLUMN "createdAt",
DROP COLUMN "eventId",
DROP COLUMN "senderId",
ADD COLUMN     "ad_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event_id" TEXT,
ADD COLUMN     "receiver_id" TEXT,
ADD COLUMN     "sender_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Message_ad_id_idx" ON "Message"("ad_id");

-- CreateIndex
CREATE INDEX "Message_event_id_idx" ON "Message"("event_id");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "Ad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
