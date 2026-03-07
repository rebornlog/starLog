// 十二星座基础数据
export interface ZodiacSign {
  id: string
  name: string
  englishName: string
  icon: string
  dateRange: string
  element: '火' | '土' | '风' | '水'
  color: string
  gradient: string
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    name: '白羊座',
    englishName: 'Aries',
    icon: '♈',
    dateRange: '3.21 - 4.19',
    element: '火',
    color: '#e53e3e',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'taurus',
    name: '金牛座',
    englishName: 'Taurus',
    icon: '♉',
    dateRange: '4.20 - 5.20',
    element: '土',
    color: '#38a169',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'gemini',
    name: '双子座',
    englishName: 'Gemini',
    icon: '♊',
    dateRange: '5.21 - 6.21',
    element: '风',
    color: '#3182ce',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'cancer',
    name: '巨蟹座',
    englishName: 'Cancer',
    icon: '♋',
    dateRange: '6.22 - 7.22',
    element: '水',
    color: '#805ad5',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'leo',
    name: '狮子座',
    englishName: 'Leo',
    icon: '♌',
    dateRange: '7.23 - 8.22',
    element: '火',
    color: '#dd6b20',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'virgo',
    name: '处女座',
    englishName: 'Virgo',
    icon: '♍',
    dateRange: '8.23 - 9.22',
    element: '土',
    color: '#38a169',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'libra',
    name: '天秤座',
    englishName: 'Libra',
    icon: '♎',
    dateRange: '9.23 - 10.23',
    element: '风',
    color: '#667eea',
    gradient: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'scorpio',
    name: '天蝎座',
    englishName: 'Scorpio',
    icon: '♏',
    dateRange: '10.24 - 11.22',
    element: '水',
    color: '#742a2a',
    gradient: 'from-red-700 to-purple-700',
  },
  {
    id: 'sagittarius',
    name: '射手座',
    englishName: 'Sagittarius',
    icon: '♐',
    dateRange: '11.23 - 12.21',
    element: '火',
    color: '#c05621',
    gradient: 'from-amber-600 to-orange-600',
  },
  {
    id: 'capricorn',
    name: '摩羯座',
    englishName: 'Capricorn',
    icon: '♑',
    dateRange: '12.22 - 1.19',
    element: '土',
    color: '#4a5568',
    gradient: 'from-gray-600 to-slate-700',
  },
  {
    id: 'aquarius',
    name: '水瓶座',
    englishName: 'Aquarius',
    icon: '♒',
    dateRange: '1.20 - 2.18',
    element: '风',
    color: '#4299e1',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'pisces',
    name: '双鱼座',
    englishName: 'Pisces',
    icon: '♓',
    dateRange: '2.19 - 3.20',
    element: '水',
    color: '#76e4f7',
    gradient: 'from-cyan-400 to-blue-500',
  },
]

// 根据日期获取星座
export function getZodiacSign(month: number, day: number): ZodiacSign | null {
  // 摩羯座特殊处理（跨年）
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return ZODIAC_SIGNS.find((s) => s.id === 'capricorn') || null
  }

  const dateValue = month * 100 + day

  const ranges: { [key: string]: [number, number] } = {
    aries: [321, 419],
    taurus: [420, 520],
    gemini: [521, 621],
    cancer: [622, 722],
    leo: [723, 822],
    virgo: [823, 922],
    libra: [923, 1023],
    scorpio: [1024, 1122],
    sagittarius: [1123, 1221],
    aquarius: [120, 218],
    pisces: [219, 320],
  }

  for (const [signId, [start, end]] of Object.entries(ranges)) {
    if (dateValue >= start && dateValue <= end) {
      return ZODIAC_SIGNS.find((s) => s.id === signId) || null
    }
  }

  return null
}
