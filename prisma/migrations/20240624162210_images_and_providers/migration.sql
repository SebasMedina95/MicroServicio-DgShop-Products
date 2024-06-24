/*
  Warnings:

  - Added the required column `providerId` to the `TBL_PRODUCTS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TBL_PRODUCTS` ADD COLUMN `providerId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `TBL_IMAGES` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` LONGTEXT NOT NULL,
    `userCreateAt` VARCHAR(30) NULL,
    `createDateAt` DATETIME(3) NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TBL_PROVIDERS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `address` VARCHAR(200) NULL,
    `phone1` VARCHAR(40) NULL,
    `phone2` VARCHAR(40) NULL,
    `email1` VARCHAR(150) NULL,
    `email2` VARCHAR(150) NULL,
    `description` LONGTEXT NULL,
    `userCreateAt` VARCHAR(30) NULL,
    `createDateAt` DATETIME(3) NULL,
    `userUpdateAt` VARCHAR(30) NULL,
    `updateDateAt` DATETIME(3) NULL,

    UNIQUE INDEX `TBL_PROVIDERS_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TBL_PRODUCTS` ADD CONSTRAINT `TBL_PRODUCTS_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `TBL_PROVIDERS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TBL_IMAGES` ADD CONSTRAINT `TBL_IMAGES_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `TBL_PRODUCTS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
