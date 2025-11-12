/*
  Warnings:

  - You are about to drop the column `destination` on the `Train` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Train` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Train` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pnrNumber]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trainNumber]` on the table `Train` will be added. If there are existing duplicate values, this will fail.
  - The required column `pnrNumber` was added to the `Booking` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `departureTime` to the `Train` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromStationId` to the `Train` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toStationId` to the `Train` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "coachNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pnrNumber" TEXT NOT NULL,
ADD COLUMN     "qrCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seatNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Confirmed';

-- AlterTable
ALTER TABLE "public"."Train" DROP COLUMN "destination",
DROP COLUMN "source",
DROP COLUMN "time",
ADD COLUMN     "departureTime" TEXT NOT NULL,
ADD COLUMN     "fromStationId" INTEGER NOT NULL,
ADD COLUMN     "runsOn" TEXT NOT NULL DEFAULT 'Daily',
ADD COLUMN     "seatConfiguration" TEXT NOT NULL DEFAULT '3AC',
ADD COLUMN     "toStationId" INTEGER NOT NULL,
ADD COLUMN     "trainType" TEXT NOT NULL DEFAULT 'Express',
ALTER COLUMN "trainNumber" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Station" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "public"."State"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "public"."State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Station_code_key" ON "public"."Station"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_pnrNumber_key" ON "public"."Booking"("pnrNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Train_trainNumber_key" ON "public"."Train"("trainNumber");

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Station" ADD CONSTRAINT "Station_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Train" ADD CONSTRAINT "Train_fromStationId_fkey" FOREIGN KEY ("fromStationId") REFERENCES "public"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Train" ADD CONSTRAINT "Train_toStationId_fkey" FOREIGN KEY ("toStationId") REFERENCES "public"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
