// app/api/upload/route.ts - 文件上传 API

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '未找到上传文件' },
        { status: 400 }
      )
    }
    
    // 验证文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      )
    }
    
    // 验证文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过 10MB 限制' },
        { status: 400 }
      )
    }
    
    // 创建上传目录
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomStr}.${fileExt}`
    const filePath = join(uploadDir, fileName)
    
    // 写入文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // 返回文件信息
    const publicPath = `/uploads/${fileName}`
    
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        path: publicPath,
        size: file.size,
        type: file.type,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${publicPath}`,
      },
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    )
  }
}
