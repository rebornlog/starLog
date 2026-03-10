import { NextResponse } from 'next/server'
import { simpleGit } from 'simple-git'
import path from 'path'

export interface TimelineEvent {
  date: string
  title: string
  description: string
  type: 'feature' | 'fix' | 'docs' | 'refactor' | 'other'
  commit: string
  author: string
}

export async function GET() {
  try {
    const repoPath = path.join(process.cwd())
    const git = simpleGit(repoPath)
    
    // 获取最近 100 条提交记录
    const log = await git.log({ maxCount: 100 })
    
    // 解析 Git 历史为时间线事件
    const events: TimelineEvent[] = log.all.map(commit => ({
      date: new Date(commit.date).toISOString().split('T')[0],
      title: commit.message.split('\n')[0].replace(/^(feat|fix|docs|refactor|chore|style|test|perf):/, '').trim(),
      description: commit.body || '',
      type: getCommitType(commit.message),
      commit: commit.hash.substring(0, 7),
      author: commit.author_name,
    }))
    
    return NextResponse.json({ 
      success: true,
      count: events.length,
      events 
    })
  } catch (error) {
    console.error('Failed to fetch timeline:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch timeline',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getCommitType(message: string): TimelineEvent['type'] {
  const lowerMsg = message.toLowerCase()
  if (lowerMsg.startsWith('feat:') || lowerMsg.startsWith('feature:')) return 'feature'
  if (lowerMsg.startsWith('fix:') || lowerMsg.startsWith('bugfix:')) return 'fix'
  if (lowerMsg.startsWith('docs:') || lowerMsg.startsWith('doc:')) return 'docs'
  if (lowerMsg.startsWith('refactor:') || lowerMsg.startsWith('refactoring:')) return 'refactor'
  if (lowerMsg.startsWith('chore:') || lowerMsg.startsWith('config:')) return 'other'
  if (lowerMsg.startsWith('style:') || lowerMsg.startsWith('format:')) return 'other'
  if (lowerMsg.startsWith('test:') || lowerMsg.startsWith('testing:')) return 'other'
  if (lowerMsg.startsWith('perf:') || lowerMsg.startsWith('performance:')) return 'feature'
  return 'other'
}
