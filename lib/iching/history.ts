/**
 * 问卦历史管理
 * 记录和查看用户的问卦历史
 */

export interface DivinationHistory {
  id: string
  timestamp: number
  method: 'random' | 'time' | 'number'
  hexagramId: number
  hexagramName: string
  numbers?: [number, number, number]
  question?: string
  questionType?: 'career' | 'love' | 'health' | 'wealth' | 'study' | 'relationship' | 'other'
  changingLines?: number[]
  transformedHexagramId?: number
  note?: string
}

const STORAGE_KEY = 'iching-history'
const MAX_HISTORY = 100

// 获取历史记录
export function getHistory(): DivinationHistory[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取历史记录失败:', error)
    return []
  }
}

// 添加历史记录
export function addHistory(record: Omit<DivinationHistory, 'id' | 'timestamp'>): DivinationHistory {
  const history = getHistory()
  
  const newRecord: DivinationHistory = {
    ...record,
    id: `divination-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  }
  
  // 添加到开头
  history.unshift(newRecord)
  
  // 限制数量
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY)
  }
  
  // 保存到 localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
  
  return newRecord
}

// 删除历史记录
export function removeHistory(id: string): boolean {
  const history = getHistory()
  const index = history.findIndex(record => record.id === id)
  
  if (index === -1) return false
  
  history.splice(index, 1)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return true
  } catch (error) {
    console.error('删除历史记录失败:', error)
    return false
  }
}

// 清空历史记录
export function clearHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清空历史记录失败:', error)
    return false
  }
}

// 获取单条记录
export function getHistoryRecord(id: string): DivinationHistory | null {
  const history = getHistory()
  return history.find(record => record.id === id) || null
}

// 按条件筛选历史记录
export function filterHistory(options?: {
  questionType?: DivinationHistory['questionType']
  hexagramId?: number
  startDate?: number
  endDate?: number
  limit?: number
}): DivinationHistory[] {
  let history = getHistory()
  
  if (options) {
    if (options.questionType) {
      history = history.filter(record => record.questionType === options.questionType)
    }
    
    if (options.hexagramId) {
      history = history.filter(record => record.hexagramId === options.hexagramId)
    }
    
    if (options.startDate) {
      history = history.filter(record => record.timestamp >= options.startDate!)
    }
    
    if (options.endDate) {
      history = history.filter(record => record.timestamp <= options.endDate!)
    }
    
    if (options.limit) {
      history = history.slice(0, options.limit)
    }
  }
  
  return history
}

// 获取统计信息
export function getHistoryStats() {
  const history = getHistory()
  
  const stats = {
    total: history.length,
    byMethod: {
      random: 0,
      time: 0,
      number: 0,
    },
    byQuestionType: {
      career: 0,
      love: 0,
      health: 0,
      wealth: 0,
      study: 0,
      relationship: 0,
      other: 0,
    },
    byHexagram: {} as Record<string, number>,
    recentDays: 0,
  }
  
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
  
  history.forEach(record => {
    // 统计起卦方式
    stats.byMethod[record.method]++
    
    // 统计问题类型
    if (record.questionType) {
      stats.byQuestionType[record.questionType]++
    }
    
    // 统计卦象
    const hexagramKey = `${record.hexagramId}-${record.hexagramName}`
    stats.byHexagram[hexagramKey] = (stats.byHexagram[hexagramKey] || 0) + 1
    
    // 统计最近 7 天
    if (record.timestamp >= sevenDaysAgo) {
      stats.recentDays++
    }
  })
  
  return stats
}

// 更新记录备注
export function updateHistoryNote(id: string, note: string): boolean {
  const history = getHistory()
  const record = history.find(r => r.id === id)
  
  if (!record) return false
  
  record.note = note
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return true
  } catch (error) {
    console.error('更新备注失败:', error)
    return false
  }
}

// 导出历史记录
export function exportHistory(): string {
  const history = getHistory()
  return JSON.stringify(history, null, 2)
}

// 导入历史记录
export function importHistory(jsonString: string): boolean {
  try {
    const history = JSON.parse(jsonString)
    if (!Array.isArray(history)) return false
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return true
  } catch (error) {
    console.error('导入历史记录失败:', error)
    return false
  }
}
