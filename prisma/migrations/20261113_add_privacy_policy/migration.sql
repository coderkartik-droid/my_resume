-- CreateTable PrivacyPolicy
CREATE TABLE "PrivacyPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Privacy Policy',
    "slug" TEXT NOT NULL DEFAULT 'privacy-policy',
    "summary" TEXT,
    "draftContent" TEXT,
    "publishedContent" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "revisions" TEXT,
    "lastEditedBy" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyPolicy_slug_key" ON "PrivacyPolicy"("slug");
