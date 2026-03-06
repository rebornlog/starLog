// 龙猫主题 - 唯一主题

export interface Theme {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string
  colors: {
    primary: string
    primaryDark: string
    primaryLight: string
    secondary: string
    accent: string
    background: string
    backgroundDark: string
    surface: string
    surfaceDark: string
    text: string
    textDark: string
    textMuted: string
  }
  gradient: string
  fontFamily: string
  borderRadius: string
  shadow: 'soft' | 'sharp' | 'elevated'
}

export const themes: Theme[] = [
  {
    id: 'totoro',
    name: '龙猫森林',
    nameEn: 'Totoro Forest',
    description: '清新自然的森林色调，灵感来自宫崎骏的龙猫',
    icon: '🌿',
    colors: {
      primary: '#4F836B',
      primaryDark: '#3D6B55',
      primaryLight: '#8FB8A8',
      secondary: '#6A9C89',
      accent: '#EB4F85',
      background: '#F0F7F4',
      backgroundDark: '#1A202C',
      surface: '#FFFFFF',
      surfaceDark: '#2D3748',
      text: '#1A202C',
      textDark: '#F7FAFC',
      textMuted: '#718096',
    },
    gradient: 'linear-gradient(135deg, #4F836B 0%, #3D6B55 100%)',
    fontFamily: 'Inter, system-ui',
    borderRadius: '12px',
    shadow: 'soft',
  },
]

export const defaultTheme = themes[0]

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) || defaultTheme
}
