'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getFundDetail, getFundHoldings, getFundNetHistory, getFundEstimate, getStockInfo } from '@/lib/fund-api';
import { Skeleton } from '@/components/Skeleton';
import RadarChart from '@/components/RadarChart';

interface PageProps {
  params: Promise<{ fund_id: string }>;
}

export default function FundDetailPage({ params }: PageProps) {
  const { fund_id } = use(params);
  const [fund, setFund] = useState<any>(null);
  const [holdings, setHoldings] = useState<any>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [netHistory, setNetHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFundData();
  }, [fund_id]);

  async function loadFundData() {
    setLoading(true);
    try {
      const [fundData, holdingsData, estimateData, netHistoryData] = await Promise.all([
        getFundDetail(fund_id),
        getFundHoldings(fund_id),
        getFundEstimate(fund_id).catch(() => null),
        getFundNetHistory(fund_id, 30).then(d => d.data),
      ]);

      setFund(fundData);
      setHoldings(holdingsData);
      setEstimate(estimateData);
      setNetHistory(netHistoryData);
    } catch (error) {
      console.error('加载基金数据失败:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatGrowth(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  function getGrowthColor(value: number): string {
    if (value > 0) return 'text-red-600';
    if (value < 0) return 'text-green-600';
    return 'text-gray-600';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">基金未找到</p>
          <Link href="/funds" className="mt-4 inline-block text-blue-600 hover:underline">
            返回基金列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/funds" className="text-blue-600 hover:underline">
            ← 返回基金列表
          </Link>
        </div>

        {/* 基金基本信息 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {fund.fund_name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                基金代码：{fund.fund_id}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {fund.net_value.toFixed(4)}
              </div>
              <div className={`text-xl font-bold ${getGrowthColor(fund.daily_growth)}`}>
                {formatGrowth(fund.daily_growth)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                净值日期：{fund.nav_date}
              </div>
            </div>
          </div>

          {/* 实时估值 */}
          {estimate && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">实时估值</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatGrowth(estimate.estimate_growth)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700 dark:text-blue-300">更新时间</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{estimate.update_time}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 持仓分析 */}
        {holdings && holdings.stocks.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              前十大持仓
            </h2>
            <div className="space-y-3">
              {holdings.stocks.map((stock: any, index: number) => (
                <div
                  key={stock.stock_code}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.stock_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stock.stock_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{stock.percentage.toFixed(2)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">占净值比</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              持仓更新日期：{holdings.update_date}
            </p>
          </div>
        )}

        {/* 净值走势 */}
        {netHistory.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">📈</span>
              净值走势（近 30 天）
            </h2>
            <div className="h-64 flex items-end gap-1">
              {netHistory.map((item, index) => {
                const maxValue = Math.max(...netHistory.map(d => d.net_value));
                const minValue = Math.min(...netHistory.map(d => d.net_value));
                const range = maxValue - minValue || 1;
                const height = ((item.net_value - minValue) / range) * 100;
                
                return (
                  <div
                    key={item.date}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${item.date}: ${item.net_value.toFixed(4)} (${formatGrowth(item.daily_growth)})`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{netHistory[0]?.date}</span>
              <span>{netHistory[netHistory.length - 1]?.date}</span>
            </div>
          </div>
        )}

        {/* 返回顶部 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full shadow-md hover:shadow-lg transition-all font-medium"
          >
            <span>🏠</span>
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
