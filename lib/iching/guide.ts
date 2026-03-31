/**
 * 问卦指引内容
 * 帮助用户在问卦前静心、聚焦问题
 */

export interface DivinationGuide {
  title: string
  description: string
  steps: GuideStep[]
  tips: string[]
}

export interface GuideStep {
  title: string
  content: string
  icon: string
}

export const DIVINATION_GUIDE: DivinationGuide = {
  title: '问卦前的准备',
  description: '易经问卦，心诚则灵。在开始之前，请花一分钟时间静心准备。',
  steps: [
    {
      title: '静心凝神',
      content: '深呼吸三次，放下杂念，让内心平静下来。问卦时的心境会影响卦象的启示。',
      icon: '🧘',
    },
    {
      title: '明确问题',
      content: '在心中清晰地默念你想问的问题。问题应该具体、真诚，避免模糊或试探性的提问。',
      icon: '💭',
    },
    {
      title: '选择起卦方式',
      content: '三种起卦方式各有特点：随机起卦最传统，时间起卦应天时，数字起卦由心发。选择与你最有感应的方式。',
      icon: '🎯',
    },
  ],
  tips: [
    '同一问题短期内不宜重复问卦',
    '问卦结果仅供参考，决策还需理性',
    '保持开放的心态，接受不同的启示',
    '重要的不是卦象本身，而是你如何理解和应用',
  ],
}

// 问题类型引导
export const QUESTION_TYPES = [
  {
    category: '事业',
    icon: '💼',
    examples: [
      '目前的工作发展方向是否正确？',
      '是否应该接受这个新的工作机会？',
      '创业时机是否成熟？',
      '如何改善与同事/上司的关系？',
    ],
  },
  {
    category: '感情',
    icon: '❤️',
    examples: [
      '这段关系的发展趋势如何？',
      '是否应该主动表白/复合？',
      '如何改善目前的感情状况？',
      '理想的伴侣特质是什么？',
    ],
  },
  {
    category: '健康',
    icon: '🏥',
    examples: [
      '目前的身体状况需要注意什么？',
      '如何调整生活方式以改善健康？',
      '是否应该进行某项治疗？',
      '养生保健的方向建议',
    ],
  },
  {
    category: '财运',
    icon: '💰',
    examples: [
      '近期的财运走势如何？',
      '是否适合进行某项投资？',
      '如何改善财务状况？',
      '理财方向的建议',
    ],
  },
  {
    category: '学业',
    icon: '📚',
    examples: [
      '考试运势如何？',
      '是否适合继续深造？',
      '如何选择专业/学校？',
      '学习效率提升的建议',
    ],
  },
  {
    category: '人际',
    icon: '👥',
    examples: [
      '如何改善人际关系？',
      '是否应该与某人和解？',
      '如何识别贵人/小人？',
      '社交方面的建议',
    ],
  },
] as const

// 问卦禁忌
export const DIVINATION_TABOOS = [
  {
    icon: '⚠️',
    title: '不诚不占',
    description: '抱着玩闹、怀疑或试探的心态不宜问卦',
  },
  {
    icon: '🔄',
    title: '不疑不占',
    description: '没有真正的疑惑，或已有明确答案的问题不宜问卦',
  },
  {
    icon: '⏰',
    title: '不频不占',
    description: '同一问题短期内不宜反复问卦，建议间隔至少一周',
  },
  {
    icon: '🎭',
    title: '不戏不占',
    description: '不要用问卦来开玩笑或测试准确性',
  },
] as const
