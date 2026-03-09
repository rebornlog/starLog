// 本地存储工具函数（LocalStorage）

export interface FavoriteItem {
  id: string;
  type: 'iching' | 'zodiac' | 'diet';
  title: string;
  data: any;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  type: 'iching' | 'zodiac' | 'diet';
  title: string;
  data: any;
  createdAt: number;
}

const STORAGE_KEYS = {
  FAVORITES: 'starlog_favorites',
  HISTORY: 'starlog_history',
};

// 最大存储数量
const MAX_FAVORITES = 50;
const MAX_HISTORY = 20;

// ============ 收藏管理 ============

/**
 * 获取所有收藏
 */
export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取收藏失败:', error);
    return [];
  }
}

/**
 * 添加收藏
 */
export function addFavorite(item: Omit<FavoriteItem, 'createdAt'>): boolean {
  try {
    const favorites = getFavorites();
    
    // 检查是否已存在
    const exists = favorites.some(f => f.id === item.id && f.type === item.type);
    if (exists) {
      return false;
    }
    
    // 添加新收藏
    const newItem: FavoriteItem = {
      ...item,
      createdAt: Date.now(),
    };
    
    favorites.unshift(newItem);
    
    // 限制数量
    if (favorites.length > MAX_FAVORITES) {
      favorites.pop();
    }
    
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('添加收藏失败:', error);
    return false;
  }
}

/**
 * 移除收藏
 */
export function removeFavorite(type: string, id: string): boolean {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => !(f.type === type && f.id === id));
    
    if (filtered.length === favorites.length) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('移除收藏失败:', error);
    return false;
  }
}

/**
 * 检查是否已收藏
 */
export function isFavorited(type: string, id: string): boolean {
  const favorites = getFavorites();
  return favorites.some(f => f.type === type && f.id === id);
}

/**
 * 按类型获取收藏
 */
export function getFavoritesByType(type: FavoriteItem['type']): FavoriteItem[] {
  const favorites = getFavorites();
  return favorites.filter(f => f.type === type);
}

// ============ 历史记录管理 ============

/**
 * 获取历史记录
 */
export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return [];
  }
}

/**
 * 添加历史记录
 */
export function addHistory(item: Omit<HistoryItem, 'createdAt'>): boolean {
  try {
    const history = getHistory();
    
    // 添加新记录
    const newItem: HistoryItem = {
      ...item,
      createdAt: Date.now(),
    };
    
    history.unshift(newItem);
    
    // 限制数量
    if (history.length > MAX_HISTORY) {
      history.pop();
    }
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('添加历史记录失败:', error);
    return false;
  }
}

/**
 * 清空历史记录
 */
export function clearHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (error) {
    console.error('清空历史记录失败:', error);
    return false;
  }
}

/**
 * 按类型获取历史记录
 */
export function getHistoryByType(type: HistoryItem['type']): HistoryItem[] {
  const history = getHistory();
  return history.filter(h => h.type === type);
}

// ============ 工具函数 ============

/**
 * 格式化时间
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 分钟内
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  
  // 天内
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }
  
  // 更多天
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 清除所有数据
 */
export function clearAll(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (error) {
    console.error('清除所有数据失败:', error);
    return false;
  }
}
