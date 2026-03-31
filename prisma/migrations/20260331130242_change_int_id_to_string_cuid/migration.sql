/*
  Warnings:

  - The primary key for the `EventParticipant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WasteMapPoint` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EventParticipant_id_seq";

-- AlterTable
ALTER TABLE "WasteMapPoint" DROP CONSTRAINT "WasteMapPoint_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WasteMapPoint_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WasteMapPoint_id_seq";
