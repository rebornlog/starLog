// 星座运势生成算法（伪随机，基于日期 + 星座）
import { ZodiacSign } from './data'

export interface DailyFortune {
  signId: string
  date: string
  overall: number // 整体运势 0-100
  love: number // 爱情运势 0-100
  career: number // 事业运势 0-100
  wealth: number // 财运 0-100
  luckyColor: string
  luckyNumber: number
  good: string[] // 宜
  bad: string[] // 忌
  description: string
}

// 幸运色池
const LUCKY_COLORS = [
  '红色',
  '橙色',
  '黄色',
  '绿色',
  '青色',
  '蓝色',
  '紫色',
  '粉色',
  '金色',
  '银色',
  '白色',
  '黑色',
  '棕色',
  '灰色',
]

// 宜忌池
const GOOD_THINGS = [
  '约会',
  '签约',
  '投资',
  '旅行',
  '学习',
  '运动',
  '聚会',
  '购物',
  '表白',
  '面试',
  '开会',
  '装修',
  '搬家',
  '理发',
  '美容',
  '健身',
  '读书',
  '写作',
  '创作',
  '谈判',
  '求职',
  '订婚',
  '结婚',
  '出行',
]

const BAD_THINGS = [
  '争吵',
  '熬夜',
  '饮酒',
  '赌博',
  '冒险',
  '借贷',
  '分手',
  '辞职',
  '手术',
  '远行',
  '投资',
  '签约',
  '搬家',
  '装修',
  '理发',
  '动土',
  '开业',
  '安葬',
  '破土',
  '开仓',
  '纳财',
  '交易',
  '购置',
  '出行',
]

// 运势描述模板
const DESCRIPTION_TEMPLATES = [
  '今天你的能量场非常稳定，适合专注于重要事务。保持平和的心态，好运自然来。',
  '星象显示今天是个充满机遇的日子，勇敢迈出第一步，会有意外收获。',
  '今天可能需要多一些耐心，事情不会一蹴而就。慢慢来，反而更快。',
  '人际关系是今天的关键词，多与人交流，可能会遇到贵人。',
  '今天适合 introspection，给自己一些独处的时间，整理思绪。',
  '创造力爆棚的一天，有任何想法都可以尝试付诸实践。',
  '财务方面需要谨慎，避免冲动消费。理性规划会让未来更轻松。',
  '感情运势上升，单身者有机会遇到心动的人，有伴侣者关系更甜蜜。',
  '工作压力可能有些大，记得适当放松。健康是最重要的财富。',
  '今天是学习新知识的好时机，你的吸收能力特别强。',
]

// 种子随机数生成器（确保同一天同一星座结果相同）
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

// 生成日期种子
function getDateSeed(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year * 10000 + month * 100 + day
}

// 生成星座运势
export function generateDailyFortune(sign: ZodiacSign, date: Date = new Date()): DailyFortune {
  const dateSeed = getDateSeed(date)
  const signSeed = sign.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const seed = dateSeed + signSeed

  const random = seededRandom(seed)

  // 生成各维度运势（60-100 之间，避免太低）
  const overall = Math.floor(random() * 41) + 60
  const love = Math.floor(random() * 41) + 60
  const career = Math.floor(random() * 41) + 60
  const wealth = Math.floor(random() * 41) + 60

  // 幸运色和数字
  const luckyColor = LUCKY_COLORS[Math.floor(random() * LUCKY_COLORS.length)]
  const luckyNumber = Math.floor(random() * 99) + 1

  // 宜忌（各选 3-5 个）
  const goodCount = Math.floor(random() * 3) + 3
  const badCount = Math.floor(random() * 3) + 3

  const good = shuffleArray([...GOOD_THINGS], random).slice(0, goodCount)
  const bad = shuffleArray([...BAD_THINGS], random).slice(0, badCount)

  // 描述
  const description = DESCRIPTION_TEMPLATES[Math.floor(random() * DESCRIPTION_TEMPLATES.length)]

  return {
    signId: sign.id,
    date: date.toISOString().split('T')[0],
    overall,
    love,
    career,
    wealth,
    luckyColor,
    luckyNumber,
    good,
    bad,
    description,
  }
}

// 数组洗牌（使用种子随机）
function shuffleArray<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 获取今日运势（对外接口）
export function getTodayFortune(signId: string): DailyFortune | null {
  const { ZODIAC_SIGNS } = require('./data')
  const sign = ZODIAC_SIGNS.find((s) => s.id === signId)
  if (!sign) return null

  return generateDailyFortune(sign, new Date())
}
