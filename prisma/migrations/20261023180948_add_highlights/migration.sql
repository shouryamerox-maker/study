-- CreateTable
CREATE TABLE `Highlight` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `blockIndex` INTEGER NOT NULL,
    `startOffset` INTEGER NOT NULL,
    `endOffset` INTEGER NOT NULL,
    `text` TEXT NOT NULL,
    `prefix` VARCHAR(64) NOT NULL DEFAULT '',
    `suffix` VARCHAR(64) NOT NULL DEFAULT '',
    `color` VARCHAR(12) NOT NULL DEFAULT 'yellow',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Highlight_userId_createdAt_idx`(`userId`, `createdAt`),
    UNIQUE INDEX `Highlight_userId_lessonId_blockIndex_startOffset_endOffset_key`(`userId`, `lessonId`, `blockIndex`, `startOffset`, `endOffset`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Highlight` ADD CONSTRAINT `Highlight_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Highlight` ADD CONSTRAINT `Highlight_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
