const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPost() {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: 'sql-optimization-100x' }
    })
    
    if (!post) {
      console.log('❌ 文章不存在')
      return
    }
    
    console.log('✅ 文章信息:')
    console.log('  ID:', post.id)
    console.log('  标题:', post.title)
    console.log('  分类:', post.category)
    console.log('  内容长度:', post.content.length)
    console.log('  内容预览 (前 500 字符):')
    console.log('---')
    console.log(post.content.substring(0, 500))
    console.log('---')
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkPost()
