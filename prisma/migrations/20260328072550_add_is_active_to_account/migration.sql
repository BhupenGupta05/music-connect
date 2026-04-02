/*
  Warnings:

  - The `tasteVector` column on the `MusicProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "refresh_token_expires_in" INTEGER;

-- AlterTable
ALTER TABLE "MusicProfile" DROP COLUMN "tasteVector",
ADD COLUMN     "tasteVector" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" VARCHAR(255),
ADD COLUMN     "name" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
