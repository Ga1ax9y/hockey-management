-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "organizationId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
