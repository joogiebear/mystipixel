-- MystiPixel Resources Database Schema
-- Import this file via phpMyAdmin or cPanel MySQL

-- Create User table
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  `emailVerified` BOOLEAN NOT NULL DEFAULT false,
  `isBanned` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_username_key`(`username`),
  UNIQUE INDEX `User_email_key`(`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Resource table
CREATE TABLE IF NOT EXISTS `Resource` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `pluginType` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NULL,
  `content` TEXT NOT NULL,
  `currentVersion` VARCHAR(191) NOT NULL,
  `isVisible` BOOLEAN NOT NULL DEFAULT true,
  `isApproved` BOOLEAN NOT NULL DEFAULT false,
  `downloadCount` INTEGER NOT NULL DEFAULT 0,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Resource_userId_idx`(`userId`),
  INDEX `Resource_pluginType_idx`(`pluginType`),
  INDEX `Resource_isApproved_idx`(`isApproved`),
  INDEX `Resource_isVisible_idx`(`isVisible`),
  INDEX `Resource_deletedAt_idx`(`deletedAt`),
  CONSTRAINT `Resource_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ResourceVersion table
CREATE TABLE IF NOT EXISTS `ResourceVersion` (
  `id` VARCHAR(191) NOT NULL,
  `resourceId` VARCHAR(191) NOT NULL,
  `version` VARCHAR(191) NOT NULL,
  `changelog` TEXT NULL,
  `zipUrl` VARCHAR(191) NOT NULL,
  `imageUrls` TEXT NULL,
  `fileSize` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ResourceVersion_resourceId_idx`(`resourceId`),
  CONSTRAINT `ResourceVersion_resourceId_fkey` FOREIGN KEY (`resourceId`) REFERENCES `Resource`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create VerificationToken table
CREATE TABLE IF NOT EXISTS `VerificationToken` (
  `id` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `VerificationToken_token_key`(`token`),
  INDEX `VerificationToken_userId_idx`(`userId`),
  CONSTRAINT `VerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
