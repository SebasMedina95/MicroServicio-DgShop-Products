/*
  Warnings:

  - You are about to alter the column `name` on the `TBL_CATEGORIES` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `userCreateAt` on the `TBL_CATEGORIES` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `userUpdateAt` on the `TBL_CATEGORIES` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to drop the column `images` on the `TBL_PRODUCTS` table. All the data in the column will be lost.
  - You are about to alter the column `sizes` on the `TBL_PRODUCTS` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(500)`.
  - You are about to alter the column `type` on the `TBL_PRODUCTS` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(500)`.
  - You are about to alter the column `userCreateAt` on the `TBL_PRODUCTS` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.
  - You are about to alter the column `userUpdateAt` on the `TBL_PRODUCTS` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(30)`.

*/
-- DropIndex
DROP INDEX `TBL_PRODUCTS_description_key` ON `TBL_PRODUCTS`;

-- AlterTable
ALTER TABLE `TBL_CATEGORIES` MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `description` LONGTEXT NULL,
    MODIFY `userCreateAt` VARCHAR(30) NULL,
    MODIFY `userUpdateAt` VARCHAR(30) NULL;

-- AlterTable
ALTER TABLE `TBL_PRODUCTS` DROP COLUMN `images`,
    MODIFY `description` LONGTEXT NOT NULL,
    MODIFY `sizes` VARCHAR(500) NOT NULL,
    MODIFY `slug` VARCHAR(500) NOT NULL,
    MODIFY `tags` VARCHAR(500) NOT NULL,
    MODIFY `colors` VARCHAR(500) NOT NULL,
    MODIFY `title` VARCHAR(200) NOT NULL,
    MODIFY `type` VARCHAR(500) NOT NULL,
    MODIFY `userCreateAt` VARCHAR(30) NULL,
    MODIFY `userUpdateAt` VARCHAR(30) NULL;
