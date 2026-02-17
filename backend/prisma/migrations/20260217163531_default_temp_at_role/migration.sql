/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "code" VARCHAR(20) NOT NULL DEFAULT 'TEMP';

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");
