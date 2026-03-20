'use client';

import type { DailyFortune } from '@/lib/zodiac/fortune';
import { ZODIAC_SIGNS } from '@/lib/zodiac/data';

interface LuckyElementsProps {
  fortune: DailyFortune;
}

// 内联 SVG 图标
const Clover = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const Hash = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const Heart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Sparkles = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// 颜色映射表
const COLOR_MAP: Record<string, string> = {
  '红色': 'bg-red-500',
  '橙色': 'bg-orange-500',
  '黄色': 'bg-yellow-500',
  '绿色': 'bg-green-500',
  '蓝色': 'bg-blue-500',
  '紫色': 'bg-purple-500',
  '粉色': 'bg-pink-500',
  '白色': 'bg-gray-100',
  '黑色': 'bg-gray-800',
  '金色': 'bg-amber-400',
  '银色': 'bg-gray-400',
  '幸运红': 'bg-red-500',
  '活力橙': 'bg-orange-500',
  '阳光黄': 'bg-yellow-500',
  '生机绿': 'bg-green-500',
  '清新蓝': 'bg-blue-500',
  '优雅紫': 'bg-purple-500',
  '浪漫粉': 'bg-pink-500',
  '神秘黑': 'bg-gray-800',
  '纯洁白': 'bg-gray-100',
  '高贵金': 'bg-amber-400',
};

// 获取颜色块样式
function getColorStyle(colorName: string): string {
  // 处理复合颜色
  const colors = colorName.split(/[、,]/);
  if (colors.length > 1) {
    return 'bg-gradient-to-r ' + colors.map(c => {
      const trimmed = c.trim();
      return COLOR_MAP[trimmed] || 'bg-gray-400';
    }).join(' ');
  }
  
  return COLOR_MAP[colorName] || 'bg-gradient-to-r from-indigo-400 to-purple-500';
}

// 宜忌图标映射
const ADVICE_ICONS: Record<string, string> = {
  '出行': '✈️',
  '旅行': '🧳',
  '约会': '💕',
  '聚会': '🎉',
  '签约': '📝',
  '谈判': '🤝',
  '投资': '📈',
  '理财': '💰',
  '求职': '💼',
  '面试': '📋',
  '学习': '📚',
  '考试': '✏️',
  '运动': '🏃',
  '健身': '💪',
  '养生': '🧘',
  '休息': '😴',
  '购物': '🛍️',
  '装饰': '🏠',
  '清洁': '🧹',
  '烹饪': '🍳',
  '聚餐': '🍽️',
  '表白': '💌',
  '结婚': '💒',
  '搬家': '📦',
  '开业': '🎊',
  '交易': '💱',
  '种植': '🌱',
  '修剪': '✂️',
  '医疗': '🏥',
  '体检': '🩺',
  '祈祷': '🙏',
  '冥想': '🧘',
  '阅读': '📖',
  '写作': '✍️',
  '创作': '🎨',
  '音乐': '🎵',
  '电影': '🎬',
  '游戏': '🎮',
  '钓鱼': '🎣',
  '登山': '⛰️',
  '游泳': '🏊',
  '骑行': '🚴',
  '驾驶': '🚗',
  '远行': '🗺️',
  '探亲': '👨‍👩‍👧',
  '访友': '👥',
  '宴请': '🍷',
  '庆典': '🎆',
  '祭祀': '🕯️',
  '安葬': '⚰️',
  '破土': '⛏️',
  '修造': '🔨',
  '动土': '🏗️',
  '上梁': '🏠',
  '入宅': '🔑',
  '移徙': '📦',
  '安床': '🛏️',
  '开市': '🏪',
  '纳财': '💵',
  '纳畜': '🐄',
  '栽种': '🌳',
  ' harvesting': '🌾',
  '捕捉': '🦋',
  '畋猎': '🏹',
  '取渔': '🎣',
  '结网': '🕸️',
  '入殓': '⚰️',
  '除服': '👔',
  '成服': '👘',
  '沐浴': '🚿',
  '剃头': '💇',
  '整容': '💄',
  '针灸': '💉',
  '治病': '💊',
  '求医': '🏥',
  '疗目': '👁️',
  '服药': '💊',
  '扫舍': '🧹',
  '整饰': '🎀',
  '修饰': '💅',
  '破屋': '🏚️',
  '坏垣': '🧱',
  '余事': '📌',
  '勿余': '⛔',
  '熬夜': '🌙',
  '争吵': '😠',
  '冲动消费': '💸',
  '高风险投资': '📉',
  '暴饮暴食': '🍔',
  '久坐不动': '🪑',
  '过度工作': '💼',
  '情绪化决策': '🎭',
  '与他人争执': '🗣️',
  '借钱': '💰',
  '担保': '📜',
  '签署重要合同': '📑',
  '开始新项目': '🚀',
  '重大决策': '⚖️',
  '长途旅行': '✈️',
  '极限运动': '🪂',
  '过度饮酒': '🍺',
};

// 获取宜忌图标
function getAdviceIcon(item: string): string {
  // 精确匹配
  if (ADVICE_ICONS[item]) return ADVICE_ICONS[item];
  
  // 模糊匹配
  for (const [key, icon] of Object.entries(ADVICE_ICONS)) {
    if (item.includes(key) || key.includes(item)) {
      return icon;
    }
  }
  
  // 默认图标
  return '✨';
}

export function LuckyElements({ fortune }: LuckyElementsProps) {
  const luckyColor = fortune.luckyColor;
  const luckyNumber = fortune.luckyNumber;
  const luckySignIndex = Math.abs(luckyNumber) % 12;
  const luckySign = ZODIAC_SIGNS[luckySignIndex];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles />
        幸运元素
      </h3>
      
      <div className="space-y-4">
        {/* 幸运颜色 */}
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Heart />
            </div>
            <span className="text-white/70 font-medium">幸运颜色</span>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className={`w-16 h-16 rounded-xl shadow-lg ${getColorStyle(luckyColor)}`}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            />
            <div className="flex-1">
              <div className="text-white font-bold text-lg">{luckyColor}</div>
              <div className="text-white/60 text-sm">
                穿戴此颜色可提升运势
              </div>
            </div>
          </div>
        </div>

        {/* 幸运数字 */}
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Hash />
            </div>
            <span className="text-white/70 font-medium">幸运数字</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {String(luckyNumber).split('').map((digit, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg"
                  style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}
                >
                  <span className="text-white font-bold text-2xl">{digit}</span>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <div className="text-white/60 text-sm">
                可用于彩票、抽奖或重要决策
              </div>
            </div>
          </div>
        </div>

        {/* 幸运星座 */}
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clover />
            </div>
            <span className="text-white/70 font-medium">幸运星座</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{luckySign.icon}</div>
            <div className="flex-1">
              <div className="text-white font-bold text-lg">{luckySign.name}</div>
              <div className="text-white/60 text-sm">{luckySign.englishName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
