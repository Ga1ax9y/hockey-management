/*
  Warnings:

  - You are about to drop the column `matchTime` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "matchTime",
ALTER COLUMN "matchDate" SET DATA TYPE TIMESTAMP(3);
