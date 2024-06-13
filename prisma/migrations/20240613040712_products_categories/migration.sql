-- CreateTable
CREATE TABLE `TBL_CATEGORIES` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `userCreateAt` VARCHAR(191) NULL,
    `createDateAt` DATETIME(3) NULL,
    `userUpdateAt` VARCHAR(191) NULL,
    `updateDateAt` DATETIME(3) NULL,

    UNIQUE INDEX `TBL_CATEGORIES_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TBL_PRODUCTS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `images` VARCHAR(191) NOT NULL,
    `inStock` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `sizes` ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `tags` VARCHAR(191) NOT NULL,
    `colors` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('shirts', 'pants', 'hoodies', 'hats') NOT NULL,
    `userCreateAt` VARCHAR(191) NULL,
    `createDateAt` DATETIME(3) NULL,
    `userUpdateAt` VARCHAR(191) NULL,
    `updateDateAt` DATETIME(3) NULL,
    `categoryId` INTEGER NOT NULL,

    UNIQUE INDEX `TBL_PRODUCTS_description_key`(`description`),
    UNIQUE INDEX `TBL_PRODUCTS_slug_key`(`slug`),
    UNIQUE INDEX `TBL_PRODUCTS_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TBL_PRODUCTS` ADD CONSTRAINT `TBL_PRODUCTS_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `TBL_CATEGORIES`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
