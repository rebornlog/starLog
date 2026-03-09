'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFavorites, removeFavorite, formatTime, FavoriteItem } from '@/lib/storage';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'iching' | 'zodiac' | 'diet'>('all');

  useEffect(() => {
    const data = getFavorites();
    setFavorites(data);
  }, []);

  const handleRemove = (type: string, id: string) => {
    if (removeFavorite(type, id)) {
      setFavorites(favorites.filter(f => !(f.type === type && f.id === id)));
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

        {/* 统计信息 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <div className="text-center md:col-span-1 col-span-2">
              <Link
                href="/"
                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                ← 返回首页
              </Link>
            </div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {[
            { key: 'all', label: '全部', icon: '📚' },
            { key: 'iching', label: '问卦', icon: '☯' },
            { key: 'zodiac', label: '星座', icon: '✨' },
            { key: 'diet', label: '饮食', icon: '🥗' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                filter === key
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-700'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* 收藏列表 */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-xl text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              还没有收藏
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              去探索喜欢的卦象和运势，添加收藏吧！
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/iching"
                className="px-6 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
              >
                易经问卦
              </Link>
              <Link
                href="/zodiac"
                className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
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
