/*
  Warnings:

  - You are about to drop the column `trainingDate` on the `Training` table. All the data in the column will be lost.
  - Added the required column `startTime` to the `Training` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Training` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Training" DROP COLUMN "trainingDate",
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;
