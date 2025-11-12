/*
  Warnings:

  - Added the required column `journeyDate` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "journeyDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passengerAge" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passengerName" TEXT NOT NULL DEFAULT '';
