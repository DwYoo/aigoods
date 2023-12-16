/*
  Warnings:

  - A unique constraint covering the columns `[currentJobId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `currentJobId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Job` (
    `id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_currentJobId_key` ON `User`(`currentJobId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_currentJobId_fkey` FOREIGN KEY (`currentJobId`) REFERENCES `Job`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
