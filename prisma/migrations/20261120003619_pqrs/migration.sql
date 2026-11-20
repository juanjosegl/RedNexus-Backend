-- CreateEnum
CREATE TYPE "PqrsType" AS ENUM ('PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA');

-- CreateEnum
CREATE TYPE "PqrsStatus" AS ENUM ('RADICADA', 'EN_REVISION', 'RESPONDIDA');

-- CreateTable
CREATE TABLE "Pqrs" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "PqrsType" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "PqrsStatus" NOT NULL DEFAULT 'RADICADA',
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pqrs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pqrs_number_key" ON "Pqrs"("number");

-- CreateIndex
CREATE INDEX "Pqrs_authorId_createdAt_idx" ON "Pqrs"("authorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Pqrs" ADD CONSTRAINT "Pqrs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
