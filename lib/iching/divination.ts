// 易经起卦算法
import { Hexagram, getHexagramById, getHexagramCharacter } from './data'

export interface DivinationResult {
  hexagram: Hexagram | undefined
  method: 'random' | 'time' | 'number'
  structure: number[] // 从下到上 6 爻
  character: string // 卦字符号
  changingLines?: number[] // 变爻位置（1-6）
  transformedHexagram?: Hexagram | null // 变卦
  transformedStructure?: number[] // 变卦结构
  timestamp: Date
}

// 生成随机数
function randomInt(min: number, max: number): number {
  // 服务端使用 crypto，客户端使用 Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return min + (array[0] % (max - min + 1))
  }
  return min + Math.floor(Math.random() * (max - min + 1))
}

// 方法 1: 随机起卦（模拟铜钱摇卦）
function randomMethod(): DivinationResult {
  const structure: number[] = []
  const changingLines: number[] = []

  // 模拟 6 次铜钱摇卦（从下到上）
  for (let i = 0; i < 6; i++) {
    // 3 枚铜钱，正面=3，反面=2
    // 总和：6=老阴（变爻），7=少阳，8=少阴，9=老阳（变爻）
    const coins = [randomInt(2, 3), randomInt(2, 3), randomInt(2, 3)]
    const sum = coins.reduce((a, b) => a + b, 0)

    if (sum === 6) {
      // 老阴（变爻）- 阴爻
      structure.push(0)
      changingLines.push(i + 1)
    } else if (sum === 7) {
      // 少阳 - 阳爻
      structure.push(1)
    } else if (sum === 8) {
      // 少阴 - 阴爻
      structure.push(0)
    } else if (sum === 9) {
      // 老阳（变爻）- 阳爻
      structure.push(1)
      changingLines.push(i + 1)
    }
  }

  const hexagramId = structure.reduce((acc, val, idx) => acc + val * Math.pow(2, idx), 0) + 1
  const transformedId = calculateTransformedHexagram(structure, changingLines.length > 0 ? changingLines : undefined)
  const transformedStructure = transformedId ? structure.map((val, idx) => {
    if (changingLines.includes(idx + 1)) {
      return val === 1 ? 0 : 1
    }
    return val
  }) : undefined

  return {
    hexagram: getHexagramById(hexagramId),
    method: 'random',
    structure,
    character: getHexagramCharacter(structure),
    changingLines: changingLines.length > 0 ? changingLines : undefined,
    transformedHexagram: transformedId ? getHexagramById(transformedId) : null,
    transformedStructure,
    timestamp: new Date(),
  }
}

// 方法 2: 时间起卦（基于当前时间）
function timeMethod(): DivinationResult {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const second = now.getSeconds()

  // 上卦：(年 + 月 + 日) % 8
  const upper = (year + month + day) % 8
  // 下卦：(年 + 月 + 日 + 时 + 分 + 秒) % 8
  const lower = (year + month + day + hour + minute + second) % 8

  // 动爻：(年 + 月 + 日 + 时 + 分 + 秒) % 6
  const changingLine = (year + month + day + hour + minute + second) % 6

  // 转换为卦象结构（简化版：使用八卦数字）
  const structure: number[] = []
  for (let i = 0; i < 3; i++) {
    structure.push((lower >> i) & 1)
    structure.push((upper >> i) & 1)
  }

  const hexagramId = structure.reduce((acc, val, idx) => acc + val * Math.pow(2, idx), 0) + 1
  const changingLines = changingLine > 0 ? [changingLine] : undefined
  const transformedId = calculateTransformedHexagram(structure, changingLines)
  const transformedStructure = transformedId ? structure.map((val, idx) => {
    if (changingLines?.includes(idx + 1)) {
      return val === 1 ? 0 : 1
    }
    return val
  }) : undefined

  return {
    hexagram: getHexagramById(hexagramId),
    method: 'time',
    structure,
    character: getHexagramCharacter(structure),
    changingLines,
    transformedHexagram: transformedId ? getHexagramById(transformedId) : null,
    transformedStructure,
    timestamp: now,
  }
}

// 方法 3: 数字起卦（用户输入 3 个数字）
function numberMethod(numbers: [number, number, number]): DivinationResult {
  const [num1, num2, num3] = numbers

  // 上卦：第一个数字 % 8
  const upper = num1 % 8
  // 下卦：第二个数字 % 8
  const lower = num2 % 8
  // 动爻：第三个数字 % 6
  const changingLine = num3 % 6

  // 转换为卦象结构
  const structure: number[] = []
  for (let i = 0; i < 3; i++) {
    structure.push((lower >> i) & 1)
    structure.push((upper >> i) & 1)
  }

  const hexagramId = structure.reduce((acc, val, idx) => acc + val * Math.pow(2, idx), 0) + 1
  const changingLines = changingLine > 0 ? [changingLine] : undefined
  const transformedId = calculateTransformedHexagram(structure, changingLines)
  const transformedStructure = transformedId ? structure.map((val, idx) => {
    if (changingLines?.includes(idx + 1)) {
      return val === 1 ? 0 : 1
    }
    return val
  }) : undefined

  return {
    hexagram: getHexagramById(hexagramId),
    method: 'number',
    structure,
    character: getHexagramCharacter(structure),
    changingLines,
    transformedHexagram: transformedId ? getHexagramById(transformedId) : null,
    transformedStructure,
    timestamp: new Date(),
  }
}

// 对外接口：起卦
export function castHexagram(
  method: 'random' | 'time' | 'number',
  numbers?: [number, number, number]
): DivinationResult {
  switch (method) {
    case 'random':
      return randomMethod()
    case 'time':
      return timeMethod()
    case 'number':
      if (!numbers) {
        throw new Error('数字起卦需要提供 3 个数字')
      }
      return numberMethod(numbers)
    default:
      throw new Error('未知的起卦方法')
  }
}

// 计算变卦（根据动爻）
export function calculateTransformedHexagram(structure: number[], changingLines?: number[]): number | null {
  if (!changingLines || changingLines.length === 0) {
    return null
  }

  // 复制卦象结构
  const transformed = [...structure]

  // 变爻：阳变阴，阴变阳
  changingLines.forEach((linePos) => {
    const index = linePos - 1  // 位置转索引（从 0 开始）
    transformed[index] = transformed[index] === 1 ? 0 : 1
  })

  // 计算新卦 ID
  const newHexagramId = transformed.reduce((acc, val, idx) => acc + val * Math.pow(2, idx), 0) + 1

  return newHexagramId
}

// 生成卦象解读（增强版）
export function interpretHexagram(result: DivinationResult): string {
  if (!result.hexagram) {
    return '无法解读卦象'
  }

  const { hexagram, changingLines, structure } = result

  let interpretation = `【${hexagram.name}卦】${hexagram.judgment}\n\n`
  interpretation += `象曰：${hexagram.image}\n\n`

  if (changingLines && changingLines.length > 0) {
    interpretation += `变爻：${changingLines.map((pos) => `第${pos}爻`).join('、')}\n\n`
    
    changingLines.forEach((pos) => {
      const line = hexagram.lines.find((l) => l.position === pos)
      if (line) {
        interpretation += `第${pos}爻：${line.text}\n`
      }
    })

    // 计算变卦
    const transformedId = calculateTransformedHexagram(structure, changingLines)
    if (transformedId) {
      const transformedHexagram = getHexagramById(transformedId)
      if (transformedHexagram) {
        interpretation += `\n变卦：${transformedHexagram.name}卦 - ${transformedHexagram.judgment}\n`
        interpretation += `启示：事物正在向"${transformedHexagram.name}"的方向发展。\n`
      }
    }
  } else {
    interpretation += '无变爻，以本卦卦辞为主。\n'
    interpretation += '启示：当前局势稳定，宜守正待时。'
  }

  // 添加生活化建议
  interpretation += '\n\n💡 生活建议：\n'
  interpretation += getLifeAdvice(hexagram, changingLines)

  return interpretation
}

// 获取生活化建议（根据卦象）
function getLifeAdvice(hexagram: any, changingLines?: number[]): string {
  const adviceMap: Record<string, string> = {
    // 1-30 卦
    '乾': '保持积极进取，但要注意适度，避免过度劳累。',
    '坤': '以柔克刚，包容万物，耐心等待时机。',
    '屯': '万事开头难，坚持初心，逐步推进。',
    '蒙': '虚心学习，不耻下问，启蒙开智。',
    '需': '耐心等待，时机未到，养精蓄锐。',
    '讼': '避免争执，以和为贵，退一步海阔天空。',
    '师': '团结一心，众志成城，领导有方。',
    '比': '亲近贤德，远离小人，建立良好人际关系。',
    '小畜': '积少成多，循序渐进，不要急于求成。',
    '履': '谨慎行事，如履薄冰，注意细节。',
    '泰': '顺势而为，把握良机，诸事顺利。',
    '否': '韬光养晦，等待转机，不宜冒进。',
    '同人': '与人合作，求同存异，共同发展。',
    '大有': '收获季节，懂得分享，感恩回馈。',
    '谦': '谦虚谨慎，不骄不躁，德行兼备。',
    '豫': '愉悦身心，但不可沉溺享乐，保持警觉。',
    '随': '随遇而安，顺势而为，不强求不执着。',
    '蛊': '革故鼎新，勇于改变，整顿积弊。',
    '临': '亲临现场，以身作则，关心他人。',
    '观': '冷静观察，审时度势，再作决策。',
    '噬嗑': '明辨是非，公正执法，惩恶扬善。',
    '贲': '注重仪表，但不可过度修饰，内在更重要。',
    '剥': '剥落旧物，去伪存真，等待重生。',
    '复': '迷途知返，回归正道，重新开始。',
    '无妄': '顺其自然，不妄为，不强求。',
    '大畜': '厚积薄发，积蓄力量，待时而动。',
    '颐': '注重养生，节制饮食，修身养性。',
    '大过': '非常时期，行非常之事，勇于担当。',
    '坎': '处险不惊，保持信心，终能脱险。',
    '离': '明辨方向，依附正道，光明磊落。',
    // 31-64 卦
    '咸': '用心感受，真诚待人，自然会有回应。',
    '恒': '持之以恒，不忘初心，终会有成。',
    '遁': '适时退避，不是懦弱，而是智慧。',
    '大壮': '力量壮大时，更要谨慎，不可妄动。',
    '晋': '积极进取，展现才华，会得到赏识。',
    '明夷': '光明受损时，韬光养晦，等待时机。',
    '家人': '家庭和睦，各司其职，万事兴旺。',
    '睽': '意见不合时，求同存异，不必强求。',
    '蹇': '遇到困难，反身修德，寻求助力。',
    '解': '解脱困境，宽恕他人，也放过自己。',
    '损': '懂得舍弃，舍即是得，不要贪心。',
    '益': '助人为乐，与人方便，自己方便。',
    '夬': '果断决策，当断则断，犹豫不决。',
    '姤': '不期而遇，珍惜缘分，但需谨慎。',
    '萃': '聚集人心，团结协作，成就大事。',
    '升': '稳步上升，积小成大，不要急躁。',
    '困': '身处困境，坚守正道，终会脱困。',
    '井': '如井养人，奉献自己，也会收获。',
    '革': '适时变革，破除旧制，迎接新生。',
    '鼎': '稳重如鼎，承担责任，成就大业。',
    '震': '面对变故，保持镇定，化危为机。',
    '艮': '懂得停止，知止而后有定。',
    '渐': '循序渐进，欲速不达，稳步前进。',
    '归妹': '婚姻大事，慎重考虑，不可冲动。',
    '丰': '丰收之时，懂得分享，不要独享。',
    '旅': '出门在外，谨慎小心，平安是福。',
    '巽': '顺势而为，灵活变通，不要固执。',
    '兑': '保持愉悦，与人友善，快乐生活。',
    '涣': '化解分歧，凝聚人心，重新出发。',
    '节': '懂得节制，适度而为，过犹不及。',
    '中孚': '诚信为本，言行一致，赢得信任。',
    '小过': '小过无妨，及时改正，不要重复。',
    '既济': '成功之时，思患预防，保持警惕。',
    '未济': '尚未成功，继续努力，不要放弃。',
  }

  return adviceMap[hexagram.name] || '保持平常心，顺势而为。'
}
