const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importPost() {
  try {
    const mdPath = path.join(__dirname, '../blog/sql-optimization-100x.md')
    const content = fs.readFileSync(mdPath, 'utf-8')
    
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (!frontmatterMatch) {
      console.error('❌ Frontmatter 格式错误')
      return
    }
    
    const frontmatter = {}
    const lines = frontmatterMatch[1].split('\n')
    lines.forEach(line => {
      const [key, ...values] = line.split(':')
      if (key && values.length) {
        let value = values.join(':').trim()
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }
        frontmatter[key.trim()] = value
      }
    })
    
    const body = frontmatterMatch[2]
    
    let tags = []
    if (frontmatter.tags) {
      tags = frontmatter.tags.replace(/[\[\]"]/g, '').split(',').map(t => t.trim())
    }
    
    console.log('📄 文章信息:')
    console.log('  标题:', frontmatter.title)
    console.log('  分类:', frontmatter.category)
    console.log('  标签:', tags)
    
    // 查找第一个用户作为作者
    let user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('⚠️  未找到用户，创建默认用户...')
      user = await prisma.user.create({
        data: {
          name: '林蒹葭',
          email: `linjiajia_${Date.now()}@example.com`,
          avatar: '/avatars/default.png'
        }
      })
      console.log('✅ 用户创建成功:', user.id)
    } else {
      console.log('✅ 找到用户:', user.id, user.name)
    }
    
    // 导入文章
    console.log('📝 导入文章到数据库...')
    const post = await prisma.post.upsert({
      where: { slug: 'sql-optimization-100x' },
      update: {
        title: frontmatter.title,
        summary: frontmatter.summary,
        content: body,
        coverImage: frontmatter.cover?.replace('.jpg', '.svg') || '/blog/covers/sql-optimization-cover.svg',
        category: frontmatter.category || '技术成长',
        tags: tags,
        readingTime: 8,
        isPublished: true,
        publishedAt: new Date(),
        authorId: user.id
      },
      create: {
        slug: 'sql-optimization-100x',
        title: frontmatter.title,
        summary: frontmatter.summary,
        content: body,
        coverImage: frontmatter.cover?.replace('.jpg', '.svg') || '/blog/covers/sql-optimization-cover.svg',
        category: frontmatter.category || '技术成长',
        tags: tags,
        readingTime: 8,
        isPublished: true,
        publishedAt: new Date(),
        authorId: user.id
      }
    })
    
    console.log('\n✅ 文章导入成功!')
    console.log('  ID:', post.id)
    console.log('  Slug:', post.slug)
    console.log('  标题:', post.title)
    console.log('  访问地址：http://47.79.20.10:3000/blog/sql-optimization-100x')
    
  } catch (error) {
    console.error('\n❌ 导入失败:', error.message)
    if (error.meta) {
      console.error('  详情:', error.meta)
    }
  } finally {
    await prisma.$disconnect()
  }
}

importPost()
