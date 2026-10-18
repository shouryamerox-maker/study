-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `status` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `studentCode` VARCHAR(40) NULL,
    `bio` VARCHAR(500) NULL,
    `avatarColor` VARCHAR(16) NULL,
    `lastActiveAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_studentCode_key`(`studentCode`),
    INDEX `User_role_status_idx`(`role`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(10) NOT NULL DEFAULT 'web',
    `userAgent` VARCHAR(255) NULL,
    `ip` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_idx`(`userId`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherInvite` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL DEFAULT 'TEACHER',
    `tokenHash` CHAR(64) NOT NULL,
    `invitedById` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TeacherInvite_tokenHash_key`(`tokenHash`),
    INDEX `TeacherInvite_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateLimit` (
    `key` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `windowStart` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Group` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupMember` (
    `groupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GroupMember_userId_idx`(`userId`),
    PRIMARY KEY (`groupId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `kind` ENUM('PROGRAMMING', 'SCIENCE', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    `description` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subject_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` TEXT NOT NULL,
    `level` VARCHAR(60) NOT NULL DEFAULT 'Beginner',
    `codeLanguage` VARCHAR(20) NULL,
    `isStarterContent` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `enforcePrerequisites` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `source` ENUM('SEED', 'EDITED') NOT NULL DEFAULT 'SEED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Course_slug_key`(`slug`),
    INDEX `Course_subjectId_idx`(`subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `source` ENUM('SEED', 'EDITED') NOT NULL DEFAULT 'SEED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Unit_courseId_order_idx`(`courseId`, `order`),
    UNIQUE INDEX `Unit_courseId_slug_key`(`courseId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chapter` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `availableFrom` DATETIME(3) NULL,
    `prerequisiteChapterId` VARCHAR(191) NULL,
    `coveredInClassAt` DATETIME(3) NULL,
    `source` ENUM('SEED', 'EDITED') NOT NULL DEFAULT 'SEED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Chapter_unitId_order_idx`(`unitId`, `order`),
    UNIQUE INDEX `Chapter_courseId_slug_key`(`courseId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topic` (
    `id` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `source` ENUM('SEED', 'EDITED') NOT NULL DEFAULT 'SEED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Topic_chapterId_order_idx`(`chapterId`, `order`),
    UNIQUE INDEX `Topic_chapterId_slug_key`(`chapterId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lesson` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` TEXT NULL,
    `estMinutes` INTEGER NOT NULL DEFAULT 15,
    `blocks` JSON NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `source` ENUM('SEED', 'EDITED') NOT NULL DEFAULT 'SEED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lesson_topicId_order_idx`(`topicId`, `order`),
    INDEX `Lesson_chapterId_idx`(`chapterId`),
    UNIQUE INDEX `Lesson_courseId_slug_key`(`courseId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileAsset` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `kind` VARCHAR(20) NOT NULL DEFAULT 'resource',
    `courseId` VARCHAR(191) NULL,
    `chapterId` VARCHAR(191) NULL,
    `lessonId` VARCHAR(191) NULL,
    `url` VARCHAR(1000) NULL,
    `mimeType` VARCHAR(120) NULL,
    `sizeBytes` INTEGER NULL,
    `data` MEDIUMBLOB NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FileAsset_courseId_idx`(`courseId`),
    INDEX `FileAsset_chapterId_idx`(`chapterId`),
    INDEX `FileAsset_lessonId_idx`(`lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Enrollment_courseId_idx`(`courseId`),
    UNIQUE INDEX `Enrollment_userId_courseId_key`(`userId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LessonProgress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'IN_PROGRESS',
    `viewCount` INTEGER NOT NULL DEFAULT 1,
    `firstViewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastViewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `LessonProgress_lessonId_idx`(`lessonId`),
    INDEX `LessonProgress_userId_lastViewedAt_idx`(`userId`, `lastViewedAt`),
    UNIQUE INDEX `LessonProgress_userId_lessonId_key`(`userId`, `lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LearningEvent` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('LOGIN', 'LESSON_VIEWED', 'LESSON_COMPLETED', 'LESSON_REOPENED', 'PRACTICE_SUBMITTED', 'CODE_RUN', 'TEST_STARTED', 'TEST_SUBMITTED', 'BOOKMARK_ADDED', 'NOTE_SAVED') NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `lessonId` VARCHAR(191) NULL,
    `refId` VARCHAR(64) NULL,
    `label` VARCHAR(255) NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LearningEvent_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `LearningEvent_type_createdAt_idx`(`type`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookmark` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Bookmark_userId_lessonId_key`(`userId`, `lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Note` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Note_userId_lessonId_idx`(`userId`, `lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `type` ENUM('MCQ', 'TRUE_FALSE', 'FILL_BLANK', 'SHORT_ANSWER', 'OUTPUT_PREDICTION', 'DEBUGGING', 'CODE_WRITING', 'LONG_ANSWER') NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `chapterId` VARCHAR(191) NULL,
    `lessonId` VARCHAR(191) NULL,
    `prompt` TEXT NOT NULL,
    `code` TEXT NULL,
    `data` JSON NOT NULL,
    `answer` JSON NOT NULL,
    `explanation` TEXT NULL,
    `hint` TEXT NULL,
    `difficulty` INTEGER NOT NULL DEFAULT 1,
    `order` INTEGER NOT NULL DEFAULT 0,
    `source` ENUM('SEED', 'EDITED') NOT NULL DEFAULT 'SEED',
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Question_slug_key`(`slug`),
    INDEX `Question_courseId_chapterId_idx`(`courseId`, `chapterId`),
    INDEX `Question_lessonId_idx`(`lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PracticeAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `response` JSON NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `score` DOUBLE NOT NULL,
    `maxScore` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PracticeAttempt_userId_questionId_createdAt_idx`(`userId`, `questionId`, `createdAt`),
    INDEX `PracticeAttempt_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CodeRun` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `context` VARCHAR(20) NOT NULL,
    `refId` VARCHAR(64) NULL,
    `language` VARCHAR(20) NOT NULL,
    `source` MEDIUMTEXT NOT NULL,
    `stdin` TEXT NULL,
    `provider` VARCHAR(20) NOT NULL,
    `status` VARCHAR(40) NOT NULL,
    `stdout` MEDIUMTEXT NULL,
    `stderr` TEXT NULL,
    `compileOutput` TEXT NULL,
    `timeMs` INTEGER NULL,
    `memoryKb` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CodeRun_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assessment` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(120) NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `instructions` TEXT NULL,
    `durationMinutes` INTEGER NULL,
    `availableFrom` DATETIME(3) NULL,
    `dueAt` DATETIME(3) NULL,
    `attemptLimit` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `resultRelease` ENUM('IMMEDIATE', 'AFTER_DUE', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    `resultsReleasedAt` DATETIME(3) NULL,
    `showAnswerKey` BOOLEAN NOT NULL DEFAULT true,
    `assignToAll` BOOLEAN NOT NULL DEFAULT false,
    `coverage` JSON NULL,
    `currentVersionId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assessment_slug_key`(`slug`),
    UNIQUE INDEX `Assessment_currentVersionId_key`(`currentVersionId`),
    INDEX `Assessment_courseId_status_idx`(`courseId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssessmentSection` (
    `id` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `instructions` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `AssessmentSection_assessmentId_order_idx`(`assessmentId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssessmentQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `type` ENUM('MCQ', 'TRUE_FALSE', 'FILL_BLANK', 'SHORT_ANSWER', 'OUTPUT_PREDICTION', 'DEBUGGING', 'CODE_WRITING', 'LONG_ANSWER') NOT NULL,
    `prompt` TEXT NOT NULL,
    `code` TEXT NULL,
    `data` JSON NOT NULL,
    `answer` JSON NOT NULL,
    `rubric` JSON NULL,
    `explanation` TEXT NULL,
    `marks` DOUBLE NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `AssessmentQuestion_sectionId_order_idx`(`sectionId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssessmentVersion` (
    `id` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `totalMarks` DOUBLE NOT NULL,
    `snapshot` JSON NOT NULL,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AssessmentVersion_assessmentId_version_key`(`assessmentId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssessmentAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `groupId` VARCHAR(191) NULL,
    `dueAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AssessmentAssignment_userId_idx`(`userId`),
    UNIQUE INDEX `AssessmentAssignment_assessmentId_userId_key`(`assessmentId`, `userId`),
    UNIQUE INDEX `AssessmentAssignment_assessmentId_groupId_key`(`assessmentId`, `groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attempt` (
    `id` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NOT NULL,
    `versionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `attemptNumber` INTEGER NOT NULL,
    `status` ENUM('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED') NOT NULL DEFAULT 'IN_PROGRESS',
    `gradingStatus` ENUM('NOT_SUBMITTED', 'PENDING_REVIEW', 'GRADED') NOT NULL DEFAULT 'NOT_SUBMITTED',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deadlineAt` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NULL,
    `score` DOUBLE NULL,
    `maxScore` DOUBLE NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Attempt_userId_status_idx`(`userId`, `status`),
    INDEX `Attempt_assessmentId_gradingStatus_idx`(`assessmentId`, `gradingStatus`),
    UNIQUE INDEX `Attempt_assessmentId_userId_attemptNumber_key`(`assessmentId`, `userId`, `attemptNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttemptResponse` (
    `id` VARCHAR(191) NOT NULL,
    `attemptId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(40) NOT NULL,
    `response` JSON NULL,
    `markedForReview` BOOLEAN NOT NULL DEFAULT false,
    `savedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `autoScore` DOUBLE NULL,
    `score` DOUBLE NULL,
    `status` ENUM('UNANSWERED', 'CORRECT', 'INCORRECT', 'PARTIAL', 'PENDING_REVIEW') NOT NULL DEFAULT 'UNANSWERED',
    `feedback` TEXT NULL,
    `evaluation` JSON NULL,
    `gradedById` VARCHAR(191) NULL,
    `gradedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AttemptResponse_attemptId_questionId_key`(`attemptId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GradeAudit` (
    `id` VARCHAR(191) NOT NULL,
    `attemptId` VARCHAR(191) NOT NULL,
    `responseId` VARCHAR(191) NOT NULL,
    `graderId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(20) NOT NULL,
    `previousScore` DOUBLE NULL,
    `newScore` DOUBLE NOT NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GradeAudit_attemptId_idx`(`attemptId`),
    INDEX `GradeAudit_responseId_idx`(`responseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherInvite` ADD CONSTRAINT `TeacherInvite_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupMember` ADD CONSTRAINT `GroupMember_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupMember` ADD CONSTRAINT `GroupMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chapter` ADD CONSTRAINT `Chapter_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chapter` ADD CONSTRAINT `Chapter_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chapter` ADD CONSTRAINT `Chapter_prerequisiteChapterId_fkey` FOREIGN KEY (`prerequisiteChapterId`) REFERENCES `Chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Topic` ADD CONSTRAINT `Topic_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FileAsset` ADD CONSTRAINT `FileAsset_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LessonProgress` ADD CONSTRAINT `LessonProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LessonProgress` ADD CONSTRAINT `LessonProgress_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LearningEvent` ADD CONSTRAINT `LearningEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `Chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PracticeAttempt` ADD CONSTRAINT `PracticeAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PracticeAttempt` ADD CONSTRAINT `PracticeAttempt_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CodeRun` ADD CONSTRAINT `CodeRun_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assessment` ADD CONSTRAINT `Assessment_currentVersionId_fkey` FOREIGN KEY (`currentVersionId`) REFERENCES `AssessmentVersion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentSection` ADD CONSTRAINT `AssessmentSection_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentQuestion` ADD CONSTRAINT `AssessmentQuestion_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentQuestion` ADD CONSTRAINT `AssessmentQuestion_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `AssessmentSection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentVersion` ADD CONSTRAINT `AssessmentVersion_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentAssignment` ADD CONSTRAINT `AssessmentAssignment_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentAssignment` ADD CONSTRAINT `AssessmentAssignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentAssignment` ADD CONSTRAINT `AssessmentAssignment_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `Assessment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `AssessmentVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptResponse` ADD CONSTRAINT `AttemptResponse_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `Attempt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttemptResponse` ADD CONSTRAINT `AttemptResponse_gradedById_fkey` FOREIGN KEY (`gradedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GradeAudit` ADD CONSTRAINT `GradeAudit_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `Attempt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GradeAudit` ADD CONSTRAINT `GradeAudit_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `AttemptResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GradeAudit` ADD CONSTRAINT `GradeAudit_graderId_fkey` FOREIGN KEY (`graderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
