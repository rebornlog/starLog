// 易经起卦算法
import { Hexagram, getHexagramById, getHexagramCharacter } from './data'

export interface DivinationResult {
  hexagram: Hexagram | undefined
  method: 'random' | 'time' | 'number'
  structure: number[] // 从下到上 6 爻
  character: string // 卦字符号
  changingLines?: number[] // 变爻位置（1-6）
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

  return {
    hexagram: getHexagramById(hexagramId),
    method: 'random',
    structure,
    character: getHexagramCharacter(structure),
    changingLines: changingLines.length > 0 ? changingLines : undefined,
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

  return {
    hexagram: getHexagramById(hexagramId),
    method: 'time',
    structure,
    character: getHexagramCharacter(structure),
    changingLines: changingLine > 0 ? [changingLine] : undefined,
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

  return {
    hexagram: getHexagramById(hexagramId),
    method: 'number',
    structure,
    character: getHexagramCharacter(structure),
    changingLines: changingLine > 0 ? [changingLine] : undefined,
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

// 生成卦象解读
export function interpretHexagram(result: DivinationResult): string {
  if (!result.hexagram) {
    return '无法解读卦象'
  }

  const { hexagram, changingLines } = result

  let interpretation = `【${hexagram.name}卦】${hexagram.judgment}\n\n`
  interpretation += `象曰：${hexagram.image}\n\n`

  if (changingLines && changingLines.length > 0) {
    interpretation += `变爻：${changingLines.map((pos) => `第${pos}爻`).join('、')}\n`
    interpretation += changingLines
      .map((pos) => {
        const line = hexagram.lines.find((l) => l.position === pos)
        return line ? `  ${pos}、${line.text}` : ''
      })
      .join('\n')
  } else {
    interpretation += '无变爻，以本卦卦辞为主。'
  }

  return interpretation
}
