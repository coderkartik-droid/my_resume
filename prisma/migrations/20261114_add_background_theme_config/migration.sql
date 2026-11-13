-- CreateTable BackgroundThemeConfig
CREATE TABLE "BackgroundThemeConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activeThemeId" TEXT NOT NULL DEFAULT 'matrix-hacker',
    "previousThemeId" TEXT,
    "animationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "animationSpeed" TEXT NOT NULL DEFAULT 'normal',
    "brightness" REAL NOT NULL DEFAULT 1.0,
    "particleDensity" REAL NOT NULL DEFAULT 1.0,
    "parallaxEnabled" BOOLEAN NOT NULL DEFAULT true,
    "themeSettings" TEXT,
    "lastAppliedBy" TEXT,
    "updatedAt" DATETIME NOT NULL
);
