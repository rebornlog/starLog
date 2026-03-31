-- 导入 SQL 优化博客文章到数据库
INSERT INTO "Post" (
  "slug",
  "title",
  "summary",
  "content",
  "coverImage",
  "category",
  "tags",
  "isPublished",
  "publishedAt",
  "readingTime",
  "authorId"
) VALUES (
  'sql-optimization-100x',
  '当我把 SQL 优化了 100 倍，CTO 给我鞠了一躬',
  '一个 SQL 查询，从 30 秒到 300 毫秒。CTO 在晨会上给我鞠躬："蒹葭，你是怎么想到的？" 我说："我只是，不想让用户等太久。"',
  '文章内容...',
  '/blog/covers/sql-optimization-cover.svg',
  '技术成长',
  '["SQL", "性能优化", "数据库", "职场", "技术成长"]',
  true,
  NOW(),
  8,
  1
) ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "category" = EXCLUDED."category",
  "tags" = EXCLUDED."tags",
  "isPublished" = EXCLUDED."isPublished",
  "publishedAt" = EXCLUDED."publishedAt",
  "readingTime" = EXCLUDED."readingTime";
