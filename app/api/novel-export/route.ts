import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 压缩包文件路径
    const zipPath = path.join(process.cwd(), '../../yima_tulong_book.zip')
    
    // 读取文件
    const file = await fs.readFile(zipPath)
    
    // 返回文件流
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="yima_tulong_book.zip"',
      },
    })
  } catch (error) {
    console.error('导出失败:', error)
    return NextResponse.json(
      { success: false, error: '导出失败，请稍后重试' },
      { status: 500 }
    )
  }
}
