-- Ley 1581: fecha de autorización del tratamiento y supresión de la cuenta en cascada

-- AlterTable
ALTER TABLE "User" ADD COLUMN "consentAt" TIMESTAMP(3);

-- Las cuentas que ya existían (datos sintéticos de la demo) quedan con la fecha de la migración
UPDATE "User" SET "consentAt" = CURRENT_TIMESTAMP WHERE "consentAt" IS NULL;

-- DropForeignKey
ALTER TABLE "HelpRequest" DROP CONSTRAINT "HelpRequest_authorId_fkey";
ALTER TABLE "Match" DROP CONSTRAINT "Match_requestId_fkey";
ALTER TABLE "Match" DROP CONSTRAINT "Match_helperId_fkey";
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_requestId_fkey";
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_authorId_fkey";
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_helperId_fkey";
ALTER TABLE "Pqrs" DROP CONSTRAINT "Pqrs_authorId_fkey";

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pqrs" ADD CONSTRAINT "Pqrs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
