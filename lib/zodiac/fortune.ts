/**
 * 星座运势分项数据
 * 水镜先生 - starLog
 */

export interface DailyFortune {
  overall: number // 整体运势 (1-5 星)
  love: number // 爱情运势 (1-5 星)
  career: number // 事业运势 (1-5 星)
  wealth: number // 财运运势 (1-5 星)
  health: number // 健康运势 (1-5 星)
  luckyNumber: number // 幸运数字
  luckyColor: string // 幸运颜色
  loveAdvice: string // 爱情建议
  careerAdvice: string // 事业建议
  wealthAdvice: string // 财运建议
  healthAdvice: string // 健康建议
  description: string // 整体运势描述
  good: string[] // 今日宜
  bad: string[] // 今日忌
}

// 运势描述库
const FORTUNE_ADVICE = {
  love: [
    '单身者有机会遇到心仪对象，主动出击会有收获',
    '有伴侣者感情升温，适合安排浪漫约会',
    '感情平稳，多沟通能增进理解',
    '桃花运旺盛，但需谨慎选择',
    '适合表白或求婚的好日子',
    '感情可能出现小波折，保持耐心',
    '旧爱可能回头，慎重考虑',
    '社交活动增多，结识新朋友的机会',
    '感情需要经营，多花时间陪伴',
    '直觉敏锐，能感受到对方的心意',
  ],
  career: [
    '工作效率高，适合处理重要任务',
    '团队合作顺利，同事关系融洽',
    '有新的工作机会出现，把握良机',
    '可能遇到挑战，但能迎刃而解',
    '适合学习新技能，提升自己',
    '领导赏识，有晋升机会',
    '工作压力较大，注意调节',
    '创意迸发，适合头脑风暴',
    '项目进展顺利，成果显著',
    '适合做决策，判断准确',
  ],
  wealth: [
    '财运亨通，有意外收入',
    '投资运佳，适合理财',
    '消费冲动，需理性购物',
    '正财稳定，偏财一般',
    '有破财风险，谨慎投资',
    '适合储蓄，不宜大额消费',
    '奖金或提成即将到账',
    '朋友推荐投资机会，可考虑',
    '财运平稳，收支平衡',
    '适合制定财务计划',
  ],
  health: [
    '精力充沛，适合运动健身',
    '注意作息规律，避免熬夜',
    '饮食清淡，少吃辛辣',
    '心情愉悦，身心状态良好',
    '注意保暖，预防感冒',
    '适合瑜伽或冥想，放松身心',
    '工作压力可能影响睡眠',
    '多喝水，保持身体水分',
    '注意用眼卫生，适当休息',
    '适合户外活动，呼吸新鲜空气',
  ],
}

const LUCKY_COLORS = [
  '幸运红', '活力橙', '阳光黄', '生机绿', '清新蓝',
  '优雅紫', '浪漫粉', '神秘黑', '纯洁白', '高贵金',
]

// 今日宜忌库
const GOOD_ACTIVITIES = [
  '约会', '表白', '聚会', '旅行', '运动', '学习', '工作', '谈判', '签约', '投资',
  '理财', '购物', '整理', '清洁', '装饰', '理发', '美甲', '健身', '瑜伽', '冥想',
  '阅读', '写作', '创作', '编程', '设计', '会议', '面试', '考试', '求职', '搬家',
]

const BAD_ACTIVITIES = [
  '熬夜', '争吵', '冲动消费', '高风险投资', '暴饮暴食', '久坐不动',
  '过度工作', '情绪化决策', '与他人争执', '借钱', '担保', '签署重要合同',
  '开始新项目', '重大决策', '长途旅行', '极限运动', '过度饮酒',
]

// 根据日期和星座生成分项运势
export function generateDailyFortune(zodiacId: string, date: Date = new Date()): DailyFortune {
  // 使用日期和星座 ID 生成种子
  const seed = hashCode(`${zodiacId}-${date.toISOString().split('T')[0]}`)
  
  // 基于种子生成各项运势（1-5 星）
  const overall = (Math.abs(seed % 5) + 1) as number
  const love = (Math.abs((seed * 7) % 5) + 1) as number
  const career = (Math.abs((seed * 11) % 5) + 1) as number
  const wealth = (Math.abs((seed * 13) % 5) + 1) as number
  const health = (Math.abs((seed * 17) % 5) + 1) as number
  
  // 幸运数字（1-99）
  const luckyNumber = Math.abs(seed % 99) + 1
  
  // 幸运颜色
  const luckyColor = LUCKY_COLORS[Math.abs(seed * 19) % LUCKY_COLORS.length]
  
  // 各项建议
  const loveAdvice = FORTUNE_ADVICE.love[Math.abs(seed * 23) % FORTUNE_ADVICE.love.length]
  const careerAdvice = FORTUNE_ADVICE.career[Math.abs(seed * 29) % FORTUNE_ADVICE.career.length]
  const wealthAdvice = FORTUNE_ADVICE.wealth[Math.abs(seed * 31) % FORTUNE_ADVICE.wealth.length]
  const healthAdvice = FORTUNE_ADVICE.health[Math.abs(seed * 37) % FORTUNE_ADVICE.health.length]
  
  // 整体运势描述
  const overallDesc = getFortuneDescription(overall)
  const description = `${overallDesc} ${loveAdvice}`
  
  // 今日宜忌（各选 3-5 项）
  const goodCount = 3 + (Math.abs(seed * 41) % 3)
  const badCount = 2 + (Math.abs(seed * 43) % 3)
  const good = shuffleArray(GOOD_ACTIVITIES, seed).slice(0, goodCount)
  const bad = shuffleArray(BAD_ACTIVITIES, seed * 47).slice(0, badCount)
  
  return {
    overall,
    love,
    career,
    wealth,
    health,
    luckyNumber,
    luckyColor,
    loveAdvice,
    careerAdvice,
    wealthAdvice,
    healthAdvice,
    description,
    good,
    bad,
  }
}

// 运势等级描述
function getFortuneDescription(score: number): string {
  const descriptions = {
    5: '今日运势极佳，诸事顺遂！',
    4: '运势不错，把握机会会有收获。',
    3: '运势平稳，按部就班即可。',
    2: '运势稍弱，需谨慎行事。',
    1: '运势低迷，宜静不宜动。',
  }
  return descriptions[score as keyof typeof descriptions] || '运势平稳。'
}

// 数组洗牌函数
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array]
  let hash = Math.abs(seed)
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280
    const j = Math.floor((hash / 233280) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 字符串哈希函数
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

// 星级渲染辅助函数
export function renderStars(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(5 - count)
}
