/*
  Warnings:

  - You are about to alter the column `userStatus` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Int`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `userStatus` INTEGER NOT NULL DEFAULT 0;
