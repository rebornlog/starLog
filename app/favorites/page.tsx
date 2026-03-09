'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFavorites, removeFavorite, formatTime, FavoriteItem } from '@/lib/storage';
import { useToast } from '@/components/Toast';

export default function FavoritesPage() {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'iching' | 'zodiac' | 'diet'>('all');
  const [showExport, setShowExport] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const data = getFavorites();
    setFavorites(data);
  }, []);

  const handleRemove = (type: string, id: string) => {
    if (removeFavorite(type, id)) {
      setFavorites(favorites.filter(f => !(f.type === type && f.id === id)));
      showToast('已取消收藏', 'info');
    }
  };

  // 导出收藏为 JSON
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(favorites, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `starlog-favorites-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      showToast(`导出成功！已下载 ${favorites.length} 条收藏`, 'success');
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      showToast('导出失败，请重试', 'error');
    }
  };

  // 导入收藏
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          // 合并收藏（去重）
          const existingIds = new Set(favorites.map(f => `${f.type}-${f.id}`));
          const newFavorites = imported.filter(
            (item: FavoriteItem) => !existingIds.has(`${item.type}-${item.id}`)
          );
          
          if (newFavorites.length > 0) {
            localStorage.setItem('starlog_favorites', JSON.stringify([...newFavorites, ...favorites]));
            setFavorites([...newFavorites, ...favorites]);
            showToast(`成功导入 ${newFavorites.length} 条收藏！`, 'success');
          } else {
            showToast('没有新的收藏需要导入', 'info');
          }
        }
      } catch (error) {
        showToast('导入失败：文件格式不正确', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 清空所有收藏
  const handleClearAll = () => {
    if (confirm('确定要清空所有收藏吗？此操作不可恢复！')) {
      localStorage.removeItem('starlog_favorites');
      setFavorites([]);
      showToast('已清空所有收藏', 'info');
    }
  };

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(f => f.type === filter);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'iching': return '问卦';
      case 'zodiac': return '星座';
      case 'diet': return '饮食';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'iching': return '☯';
      case 'zodiac': return '✨';
      case 'diet': return '🥗';
      default: return '📌';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-900 dark:text-purple-100 mb-4">
            ⭐ 我的收藏 ⭐
          </h1>
          <p className="text-purple-700 dark:text-purple-300 text-lg">
            珍藏的卦象与运势
          </p>
        </div>

        {/* 统计信息和管理按钮 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          {/* 统计 + 管理按钮 */}
          <div className="flex flex-col gap-4 mb-6">
            {/* 统计 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{favorites.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">总收藏</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {favorites.filter(f => f.type === 'iching').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">问卦</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {favorites.filter(f => f.type === 'zodiac').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">星座</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {favorites.filter(f => f.type === 'diet').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">饮食</p>
            </div>
            </div>
            
            {/* 管理按钮 - 移动端优化 */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              <button
                onClick={handleExport}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] touch-manipulation"
                title="导出收藏为 JSON 文件"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">导出</span>
              </button>
              
              <label className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] touch-manipulation cursor-pointer active:scale-95 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">导入</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleClearAll}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
                title="清空所有收藏"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">清空</span>
              </button>
              
              <Link
                href="/"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] touch-manipulation active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">首页</span>
              </Link>
            </div>
          </div>
          
          {/* 导出成功提示 */}
          {exportSuccess && (
            <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-lg text-center text-sm font-medium animate-pulse">
              ✅ 导出成功！
            </div>
          )}
        </div>

        {/* 筛选器 - 移动端优化 */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 justify-center">
          {[
            { key: 'all', label: '全部', icon: '📚' },
            { key: 'iching', label: '问卦', icon: '☯' },
            { key: 'zodiac', label: '星座', icon: '✨' },
            { key: 'diet', label: '饮食', icon: '🥗' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all min-h-[44px] touch-manipulation active:scale-95 ${
                filter === key
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-base sm:inline">{icon}</span>
              <span className="ml-1.5 sm:ml-2 text-sm sm:text-base">{label}</span>
            </button>
          ))}
        </div>

        {/* 收藏列表 */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 sm:p-12 shadow-xl text-center">
            <div className="text-5xl sm:text-6xl mb-4">📭</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              还没有收藏
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              去探索喜欢的卦象和运势，添加收藏吧！
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/iching"
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                ☯ 问卦
              </Link>
              <Link
                href="/zodiac"
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                星座运势
              </Link>
              <Link
                href="/diet"
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              >
                能量饮食
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFavorites.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        {getTypeLabel(item.type)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    {item.data?.description && (
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {item.data.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(item.type, item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="取消收藏"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 底部导航 */}
        <div className="mt-12 flex flex-wrap gap-6 justify-center">
          <Link href="/iching" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
            ☯ 易经问卦
          </Link>
          <Link href="/zodiac" className="text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 transition-colors">
            ✨ 星座运势
          </Link>
          <Link href="/diet" className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors">
            🥗 能量饮食
          </Link>
        </div>
      </div>
    </div>
  );
}
