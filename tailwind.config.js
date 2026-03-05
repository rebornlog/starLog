/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // 龙猫主题色系
      colors: {
        // 主色调 - 龙猫绿
        'totoro': {
          50: '#F0F7F4',
          100: '#D9E8E0',
          200: '#B8D4C8',
          300: '#8FB8A8',
          400: '#6A9C89',
          500: '#4F836B',  // 主色
          600: '#3D6B55',
          700: '#315645',
          800: '#2A4739',
          900: '#243A30',
        },
        // 煤炭精灵灰
        'soot': {
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D0D0D0',
          300: '#B0B0B0',
          400: '#8C8C8C',
          500: '#6E6E6E',
          600: '#585858',
          700: '#474747',
          800: '#3D3D3D',
          900: '#353535',
        },
        //  Mei 粉
        'mei': {
          50: '#FEF2F6',
          100: '#FDE4EC',
          200: '#FBC9D9',
          300: '#F7A3BE',
          400: '#F2769F',
          500: '#EB4F85',
          600: '#D9336B',
          700: '#B52656',
          800: '#932348',
          900: '#78223E',
        },
        // 森林大地色
        'forest': {
          50: '#F9F7F2',
          100: '#F1EDE4',
          200: '#E4DCC9',
          300: '#D1C4A8',
          400: '#B8A882',
          500: '#9F8F66',
          600: '#857652',
          700: '#6B5F44',
          800: '#574D38',
          900: '#474030',
        },
        // 月光黄
        'moonlight': {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Lexend', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // 龙猫渐变
        'totoro-gradient': 'linear-gradient(135deg, #4F836B 0%, #3D6B55 100%)',
        // 森林渐变
        'forest-gradient': 'linear-gradient(180deg, #8FB8A8 0%, #6A9C89 50%, #4F836B 100%)',
        // 夜空渐变
        'night-sky': 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        // 月光渐变
        'moonlight-gradient': 'radial-gradient(circle at center, #FEF9C3 0%, transparent 70%)',
      },
      animation: {
        // 树叶飘落
        'leaf-fall': 'leaf-fall 3s linear infinite',
        // 星光闪烁
        'twinkle': 'twinkle 2s ease-in-out infinite',
        // 浮动
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'leaf-fall': {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
