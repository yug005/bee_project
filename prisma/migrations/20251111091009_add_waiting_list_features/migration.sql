-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "waitingPosition" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'Waiting';
