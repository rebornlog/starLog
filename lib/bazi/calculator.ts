// 八字排盘基础数据与算法

// 十天干
export const HEAVENLY_STEMS = [
  { name: '甲', pinyin: 'jiǎ', element: '木', yinYang: '阳' },
  { name: '乙', pinyin: 'yǐ', element: '木', yinYang: '阴' },
  { name: '丙', pinyin: 'bǐng', element: '火', yinYang: '阳' },
  { name: '丁', pinyin: 'dīng', element: '火', yinYang: '阴' },
  { name: '戊', pinyin: 'wù', element: '土', yinYang: '阳' },
  { name: '己', pinyin: 'jǐ', element: '土', yinYang: '阴' },
  { name: '庚', pinyin: 'gēng', element: '金', yinYang: '阳' },
  { name: '辛', pinyin: 'xīn', element: '金', yinYang: '阴' },
  { name: '壬', pinyin: 'rén', element: '水', yinYang: '阳' },
  { name: '癸', pinyin: 'guǐ', element: '水', yinYang: '阴' },
]

// 十二地支
export const EARTHLY_BRANCHES = [
  { name: '子', pinyin: 'zǐ', element: '水', yinYang: '阳', animal: '鼠' },
  { name: '丑', pinyin: 'chǒu', element: '土', yinYang: '阴', animal: '牛' },
  { name: '寅', pinyin: 'yín', element: '木', yinYang: '阳', animal: '虎' },
  { name: '卯', pinyin: 'mǎo', element: '木', yinYang: '阴', animal: '兔' },
  { name: '辰', pinyin: 'chén', element: '土', yinYang: '阳', animal: '龙' },
  { name: '巳', pinyin: 'sì', element: '火', yinYang: '阴', animal: '蛇' },
  { name: '午', pinyin: 'wǔ', element: '火', yinYang: '阳', animal: '马' },
  { name: '未', pinyin: 'wèi', element: '土', yinYang: '阴', animal: '羊' },
  { name: '申', pinyin: 'shēn', element: '金', yinYang: '阳', animal: '猴' },
  { name: '酉', pinyin: 'yǒu', element: '金', yinYang: '阴', animal: '鸡' },
  { name: '戌', pinyin: 'xū', element: '土', yinYang: '阳', animal: '狗' },
  { name: '亥', pinyin: 'hài', element: '水', yinYang: '阴', animal: '猪' },
]

// 五行
export const FIVE_ELEMENTS = ['金', '木', '水', '火', '土']

// 五行相生：金→水→木→火→土→金
export const ELEMENT_GENERATION: { [key: string]: string } = {
  金: '水',
  水: '木',
  木: '火',
  火: '土',
  土: '金',
}

// 五行相克：金→木→土→水→火→金
export const ELEMENT_RESTRAINT: { [key: string]: string } = {
  金: '木',
  木: '土',
  土: '水',
  水: '火',
  火: '金',
}

export interface BaziResult {
  yearPillar: Pillar // 年柱
  monthPillar: Pillar // 月柱
  dayPillar: Pillar // 日柱
  hourPillar: Pillar // 时柱
  elements: ElementCount // 五行统计
  strongElements: string[] // 强五行
  weakElements: string[] // 弱五行
}

export interface Pillar {
  heavenlyStem: { name: string; element: string; yinYang: string }
  earthlyBranch: { name: string; element: string; yinYang: string; animal: string }
}

export interface ElementCount {
  金: number
  木: number
  水: number
  火: number
  土: number
}

// 计算年柱
function getYearPillar(year: number): Pillar {
  // 以立春为界，简化处理：直接使用年份
  // 1984 年为甲子年
  const baseYear = 1984
  const stemIndex = (year - baseYear) % 10
  const branchIndex = (year - baseYear) % 12

  return {
    heavenlyStem: HEAVENLY_STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
    earthlyBranch: EARTHLY_BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
  }
}

// 计算月柱（简化版，按农历月份）
function getMonthPillar(year: number, month: number): Pillar {
  const yearStemIndex = (year - 1984) % 10
  // 月干推算：甲己之年丙作首，乙庚之岁戊为头...
  const monthStemStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0, 2, 4] // 对应年干
  const stemIndex =
    (monthStemStart[yearStemIndex >= 0 ? yearStemIndex : yearStemIndex + 10] + month - 1) % 10
  const branchIndex = (month + 2) % 12 // 寅月为正月

  return {
    heavenlyStem: HEAVENLY_STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
    earthlyBranch: EARTHLY_BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
  }
}

// 计算日柱（简化算法）
function getDayPillar(year: number, month: number, day: number): Pillar {
  // 简化：使用儒略日计算
  const date = new Date(year, month - 1, day)
  const baseDate = new Date(1984, 0, 1) // 1984 年 1 月 1 日甲子日
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))

  const stemIndex = diffDays % 10
  const branchIndex = diffDays % 12

  return {
    heavenlyStem: HEAVENLY_STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
    earthlyBranch: EARTHLY_BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
  }
}

// 计算时柱
function getHourPillar(dayStem: string, hour: number): Pillar {
  const dayStemIndex = HEAVENLY_STEMS.findIndex((s) => s.name === dayStem)
  // 时干推算：甲己还加甲，乙庚丙作初...
  const hourStemStart = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8, 0, 2]
  const stemIndex = (hourStemStart[dayStemIndex] + Math.floor(hour / 2)) % 10

  // 时支：子时 (23-1), 丑时 (1-3), ...
  const branchIndex = ((hour + 1) % 24) / 2

  return {
    heavenlyStem: HEAVENLY_STEMS[stemIndex],
    earthlyBranch: EARTHLY_BRANCHES[Math.floor(branchIndex)],
  }
}

// 统计五行数量
function countElements(bazi: BaziResult): ElementCount {
  const count: ElementCount = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }

  const pillars = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar]

  for (const pillar of pillars) {
    count[pillar.heavenlyStem.element as keyof ElementCount]++
    count[pillar.earthlyBranch.element as keyof ElementCount]++
  }

  return count
}

// 分析五行强弱
function analyzeElementStrength(elements: ElementCount): { strong: string[]; weak: string[] } {
  const avg = 8 / 5 // 八字共 8 个字，5 种五行，平均 1.6
  const strong: string[] = []
  const weak: string[] = []

  for (const element of FIVE_ELEMENTS) {
    const count = elements[element as keyof ElementCount]
    if (count >= 2) {
      strong.push(element)
    } else if (count <= 1) {
      weak.push(element)
    }
  }

  return { strong, weak }
}

// 对外接口：排八字
export function calculateBazi(year: number, month: number, day: number, hour: number): BaziResult {
  const yearPillar = getYearPillar(year)
  const monthPillar = getMonthPillar(year, month)
  const dayPillar = getDayPillar(year, month, day)
  const hourPillar = getHourPillar(dayPillar.heavenlyStem.name, hour)

  const result: BaziResult = {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    elements: { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 },
    strongElements: [],
    weakElements: [],
  }

  result.elements = countElements(result)
  const strength = analyzeElementStrength(result.elements)
  result.strongElements = strength.strong
  result.weakElements = strength.weak

  return result
}

// 获取五行对应的颜色
export function getElementColor(element: string): string {
  const colors: { [key: string]: string } = {
    金: '#fbbf24', // 金色
    木: '#22c55e', // 绿色
    水: '#3b82f6', // 蓝色
    火: '#ef4444', // 红色
    土: '#a855f7', // 紫色
  }
  return colors[element] || '#6b7280'
}
