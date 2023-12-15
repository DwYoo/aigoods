/*
  Warnings:

  - You are about to drop the column `accessToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `idToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresIn` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `sessionState` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[folderPath]` on the table `TrainImageSet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zipPath]` on the table `TrainImageSet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `petName` to the `TrainImageSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userStatus` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `userType` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Account` DROP COLUMN `accessToken`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `idToken`,
    DROP COLUMN `refreshToken`,
    DROP COLUMN `refreshTokenExpiresIn`,
    DROP COLUMN `sessionState`,
    DROP COLUMN `tokenType`,
    ADD COLUMN `access_token` TEXT NULL,
    ADD COLUMN `expires_at` INTEGER NULL,
    ADD COLUMN `id_token` TEXT NULL,
    ADD COLUMN `refresh_token` TEXT NULL,
    ADD COLUMN `refresh_token_expires_in` INTEGER NULL,
    ADD COLUMN `session_state` VARCHAR(191) NULL,
    ADD COLUMN `token_type` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TrainImageSet` ADD COLUMN `petName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerified` DATETIME(3) NULL,
    ADD COLUMN `userStatus` ENUM('New', 'TrainInProcess', 'TrainComplete', 'InferInProcess', 'InferComplete') NOT NULL,
    MODIFY `userType` ENUM('User', 'Admin') NOT NULL DEFAULT 'User';

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `TrainImageSet_folderPath_key` ON `TrainImageSet`(`folderPath`);

-- CreateIndex
CREATE UNIQUE INDEX `TrainImageSet_zipPath_key` ON `TrainImageSet`(`zipPath`);
