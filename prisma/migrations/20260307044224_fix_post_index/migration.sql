-- DropIndex
DROP INDEX "Post_title_content_idx";

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "Post"("slug");
