-- AlterTable Project: add categoryId
ALTER TABLE "Project" ADD COLUMN "categoryId" TEXT REFERENCES "ProjectCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable Skill: add categoryId
ALTER TABLE "Skill" ADD COLUMN "categoryId" TEXT REFERENCES "SkillCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable AdminSession
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable LoginHistory
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable PasswordResetToken
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable ProjectCategory
CREATE TABLE "ProjectCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable SkillCategory
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable ThemeHistory
CREATE TABLE "ThemeHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "themeId" TEXT NOT NULL,
    "customOverrides" TEXT,
    "appliedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable VisualConfigRevision
CREATE TABLE "VisualConfigRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshot" TEXT NOT NULL,
    "appliedBy" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable Playlist
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable MediaAsset
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileSizeFormatted" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Indexes for Admin & Auth
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");
CREATE INDEX "AdminSession_tokenHash_idx" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

CREATE INDEX "LoginHistory_userId_idx" ON "LoginHistory"("userId");
CREATE INDEX "LoginHistory_ip_idx" ON "LoginHistory"("ip");
CREATE INDEX "LoginHistory_createdAt_idx" ON "LoginHistory"("createdAt");

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_resource_idx" ON "AuditLog"("resource");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

-- Indexes for Categories
CREATE UNIQUE INDEX "ProjectCategory_name_key" ON "ProjectCategory"("name");
CREATE UNIQUE INDEX "ProjectCategory_slug_key" ON "ProjectCategory"("slug");
CREATE INDEX "ProjectCategory_order_idx" ON "ProjectCategory"("order");

CREATE UNIQUE INDEX "SkillCategory_name_key" ON "SkillCategory"("name");
CREATE UNIQUE INDEX "SkillCategory_slug_key" ON "SkillCategory"("slug");
CREATE INDEX "SkillCategory_order_idx" ON "SkillCategory"("order");

-- Indexes for Config Revisions
CREATE INDEX "ThemeHistory_themeId_idx" ON "ThemeHistory"("themeId");
CREATE INDEX "ThemeHistory_createdAt_idx" ON "ThemeHistory"("createdAt");
CREATE INDEX "VisualConfigRevision_createdAt_idx" ON "VisualConfigRevision"("createdAt");

-- Indexes for Playlist
CREATE UNIQUE INDEX "Playlist_name_key" ON "Playlist"("name");
CREATE INDEX "Playlist_order_idx" ON "Playlist"("order");

-- Indexes for MediaAsset
CREATE INDEX "MediaAsset_category_idx" ON "MediaAsset"("category");
CREATE INDEX "MediaAsset_mimeType_idx" ON "MediaAsset"("mimeType");
CREATE INDEX "MediaAsset_visible_idx" ON "MediaAsset"("visible");
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- Indexes for Existing Portfolio Models
CREATE INDEX "Project_category_idx" ON "Project"("category");
CREATE INDEX "Project_categoryId_idx" ON "Project"("categoryId");
CREATE INDEX "Project_featured_published_idx" ON "Project"("featured", "published");
CREATE INDEX "Project_order_idx" ON "Project"("order");

CREATE INDEX "Skill_category_idx" ON "Skill"("category");
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");
CREATE INDEX "Skill_order_idx" ON "Skill"("order");

CREATE INDEX "ProjectFile_projectId_idx" ON "ProjectFile"("projectId");
CREATE INDEX "ProjectFile_fileType_idx" ON "ProjectFile"("fileType");
CREATE INDEX "ProjectFile_visible_idx" ON "ProjectFile"("visible");
CREATE INDEX "ProjectFile_order_idx" ON "ProjectFile"("order");

CREATE INDEX "DownloadLog_fileId_idx" ON "DownloadLog"("fileId");
CREATE INDEX "DownloadLog_createdAt_idx" ON "DownloadLog"("createdAt");

CREATE INDEX "Experience_type_idx" ON "Experience"("type");
CREATE INDEX "Experience_order_idx" ON "Experience"("order");

CREATE INDEX "Service_order_idx" ON "Service"("order");

CREATE INDEX "Message_read_idx" ON "Message"("read");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

CREATE INDEX "Testimonial_featured_order_idx" ON "Testimonial"("featured", "order");

CREATE INDEX "Certification_order_idx" ON "Certification"("order");

CREATE INDEX "MusicTrack_enabled_order_idx" ON "MusicTrack"("enabled", "order");
CREATE INDEX "MusicTrack_playlist_idx" ON "MusicTrack"("playlist");
