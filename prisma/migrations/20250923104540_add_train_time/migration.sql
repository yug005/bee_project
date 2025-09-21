/*
  Warnings:

  - Added the required column `time` to the `Train` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Train" ADD COLUMN     "time" TEXT NOT NULL;
