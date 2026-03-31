/**
 * 六十四卦五行属性数据
 */

export interface FiveElements {
  element: string      // 五行
  direction: string    // 方位
  season: string       // 季节
  attribute: string    // 属性
}

export const FIVE_ELEMENTS: Record<number, FiveElements> = {
  1: {  // 乾卦
    element: '金',
    direction: '西北',
    season: '秋冬之交',
    attribute: '刚健',
  },
  2: {  // 坤卦
    element: '土',
    direction: '西南',
    season: '夏秋之交',
    attribute: '柔顺',
  },
  3: {  // 屯卦
    element: '水',
    direction: '北方',
    season: '春季',
    attribute: '始生',
  },
  4: {  // 蒙卦
    element: '水',
    direction: '北方',
    season: '春季',
    attribute: '启蒙',
  },
  5: {  // 需卦
    element: '水',
    direction: '北方',
    season: '春季',
    attribute: '等待',
  },
  6: {  // 讼卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '争讼',
  },
  7: {  // 师卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '战争',
  },
  8: {  // 比卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '亲密',
  },
  9: {  // 小畜卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '积蓄',
  },
  10: {  // 履卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '履行',
  },
  11: {  // 泰卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '通达',
  },
  12: {  // 否卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '闭塞',
  },
  13: {  // 同人卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '和睦',
  },
  14: {  // 大有卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '丰收',
  },
  15: {  // 谦卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '谦虚',
  },
  16: {  // 豫卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '愉悦',
  },
  17: {  // 随卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '随和',
  },
  18: {  // 蛊卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '革新',
  },
  19: {  // 临卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '降临',
  },
  20: {  // 观卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '观察',
  },
  21: {  // 噬嗑卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '咬合',
  },
  22: {  // 贲卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '装饰',
  },
  23: {  // 剥卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '剥落',
  },
  24: {  // 复卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '回复',
  },
  25: {  // 无妄卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '无妄',
  },
  26: {  // 大畜卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '积蓄',
  },
  27: {  // 颐卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '颐养',
  },
  28: {  // 大过卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '过度',
  },
  29: {  // 坎卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '险陷',
  },
  30: {  // 离卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '附丽',
  },
  31: {  // 咸卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '感应',
  },
  32: {  // 恒卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '恒久',
  },
  33: {  // 遁卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '退避',
  },
  34: {  // 大壮卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '壮大',
  },
  35: {  // 晋卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '前进',
  },
  36: {  // 明夷卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '光明受损',
  },
  37: {  // 家人卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '家庭',
  },
  38: {  // 睽卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '乖离',
  },
  39: {  // 蹇卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '困难',
  },
  40: {  // 解卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '解脱',
  },
  41: {  // 损卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '减损',
  },
  42: {  // 益卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '增益',
  },
  43: {  // 夬卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '决断',
  },
  44: {  // 姤卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '相遇',
  },
  45: {  // 萃卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '聚集',
  },
  46: {  // 升卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '上升',
  },
  47: {  // 困卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '困顿',
  },
  48: {  // 井卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '滋养',
  },
  49: {  // 革卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '变革',
  },
  50: {  // 鼎卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '鼎立',
  },
  51: {  // 震卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '震动',
  },
  52: {  // 艮卦
    element: '土',
    direction: '中央',
    season: '四季',
    attribute: '静止',
  },
  53: {  // 渐卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '渐进',
  },
  54: {  // 归妹卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '婚嫁',
  },
  55: {  // 丰卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '丰盛',
  },
  56: {  // 旅卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '旅行',
  },
  57: {  // 巽卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '顺从',
  },
  58: {  // 兑卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '喜悦',
  },
  59: {  // 涣卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '涣散',
  },
  60: {  // 节卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '节制',
  },
  61: {  // 中孚卦
    element: '木',
    direction: '东方',
    season: '春季',
    attribute: '诚信',
  },
  62: {  // 小过卦
    element: '金',
    direction: '西方',
    season: '秋季',
    attribute: '小过',
  },
  63: {  // 既济卦
    element: '水',
    direction: '北方',
    season: '冬季',
    attribute: '完成',
  },
  64: {  // 未济卦
    element: '火',
    direction: '南方',
    season: '夏季',
    attribute: '未完成',
  },
}

/**
 * 获取卦的五行属性
 */
export function getFiveElements(hexagramNumber: number): FiveElements | undefined {
  return FIVE_ELEMENTS[hexagramNumber]
}

/**
 * 五行相生
 */
export const ELEMENT_GENERATES = {
  '金': '水',
  '水': '木',
  '木': '火',
  '火': '土',
  '土': '金',
}

/**
 * 五行相克
 */
export const ELEMENT_OVERCOMES = {
  '金': '木',
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
}
