-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "displayNumber" TEXT NOT NULL DEFAULT '01',
    "category" TEXT NOT NULL DEFAULT 'Web Development',
    "shortDesc" TEXT NOT NULL,
    "fullDesc" TEXT,
    "objectives" TEXT,
    "problem" TEXT,
    "solution" TEXT,
    "keyFeatures" TEXT,
    "challenges" TEXT,
    "techStack" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "screenshots" TEXT,
    "liveUrl" TEXT,
    "githubUrl" TEXT,
    "documentationUrl" TEXT,
    "videoDemoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileSizeFormatted" TEXT NOT NULL,
    "fileDescription" TEXT,
    "storagePath" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL DEFAULT 'Download',
    "version" TEXT DEFAULT 'v1.0.0',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DownloadLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DownloadLog_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ProjectFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'work',
    "role" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "location" TEXT,
    "period" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "features" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'profile_default',
    "name" TEXT NOT NULL DEFAULT 'Kartik',
    "tagline" TEXT NOT NULL DEFAULT 'Creative Developer | Web Developer | UI/UX Enthusiast',
    "bio" TEXT NOT NULL DEFAULT 'I build digital experiences that combine creativity, technology and innovation.',
    "aboutStory" TEXT,
    "avatarUrl" TEXT,
    "resumeUrl" TEXT,
    "email" TEXT NOT NULL DEFAULT 'kartik@example.com',
    "phone" TEXT,
    "location" TEXT NOT NULL DEFAULT 'India',
    "githubUrl" TEXT DEFAULT 'https://github.com',
    "linkedinUrl" TEXT DEFAULT 'https://linkedin.com',
    "twitterUrl" TEXT DEFAULT 'https://twitter.com',
    "websiteTitle" TEXT NOT NULL DEFAULT 'Kartik | Creative Developer & 3D Interactive Portfolio',
    "footerText" TEXT NOT NULL DEFAULT 'Crafted with passion, precision & cutting-edge WebGL technology.',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'active_theme_config',
    "activeThemeId" TEXT NOT NULL DEFAULT 'midnight-dark',
    "draftThemeId" TEXT,
    "previousThemeId" TEXT,
    "customOverrides" TEXT,
    "animationSettings" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "credentialUrl" TEXT,
    "badgeUrl" TEXT,
    "skills" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteVisualConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'active_visual_config',
    "heroConfig" TEXT,
    "aboutConfig" TEXT,
    "threeDConfig" TEXT,
    "sectionsConfig" TEXT,
    "contactConfig" TEXT,
    "footerConfig" TEXT,
    "draftConfig" TEXT,
    "publishedConfig" TEXT,
    "revisions" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MusicTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL DEFAULT 'Ambient Soundscape',
    "album" TEXT DEFAULT 'Portfolio Ambience',
    "coverUrl" TEXT,
    "audioUrl" TEXT NOT NULL,
    "storagePath" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "duration" REAL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "playlist" TEXT NOT NULL DEFAULT 'Default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MusicConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'active_music_config',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "showTopbarToggle" BOOLEAN NOT NULL DEFAULT true,
    "defaultTrackId" TEXT,
    "defaultVolume" REAL NOT NULL DEFAULT 0.35,
    "autoplayAttempt" BOOLEAN NOT NULL DEFAULT false,
    "loop" BOOLEAN NOT NULL DEFAULT true,
    "shuffle" BOOLEAN NOT NULL DEFAULT false,
    "playbackMode" TEXT NOT NULL DEFAULT 'playlist',
    "activePlaylist" TEXT NOT NULL DEFAULT 'all',
    "buttonStyle" TEXT NOT NULL DEFAULT 'equalizer',
    "buttonPosition" TEXT NOT NULL DEFAULT 'topbar-right',
    "maxUploadSizeMb" INTEGER NOT NULL DEFAULT 50,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
