-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('ONE_WAY', 'TWO_WAY', 'ENTRY_LEVEL', 'TRY_OUT');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "contractType" "ContractType" NOT NULL DEFAULT 'ONE_WAY';
