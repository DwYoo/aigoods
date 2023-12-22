/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `TrainImageSet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TrainImageSet_userId_key` ON `TrainImageSet`(`userId`);
