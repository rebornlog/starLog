'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFundList, getFundEstimate, type Fund } from '@/lib/fund-api';
import { Skeleton } from '@/components/Skeleton';

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('混合基金');
  const [estimates, setEstimates] = useState<Record<string, number>>({});

  const fundTypes = ['混合基金', '股票基金', '债券基金', '指数基金', 'QDII'];

  useEffect(() => {
    loadFunds();
  }, [selectedType]);

  async function loadFunds() {
    setLoading(true);
    try {
      const data = await getFundList(selectedType, 50);
      setFunds(data.funds);
      
      // 批量获取估值（前 20 只）
      const estimatePromises = data.funds.slice(0, 20).map(fund => 
        getFundEstimate(fund.fund_id).catch(() => null)
      );
      const estimateResults = await Promise.all(estimatePromises);
      
      const estimateMap: Record<string, number> = {};
      estimateResults.forEach((result, index) => {
        if (result) {
          estimateMap[data.funds[index].fund_id] = result.estimate_growth;
        }
      });
      setEstimates(estimateMap);
    } catch (error) {
      console.error('加载基金列表失败:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatGrowth(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  function getGrowthColor(value: number): string {
    if (value > 0) return 'text-red-600 dark:text-red-400';
    if (value < 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              💰 基金中心
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            实时估值 · 智能分析 · 免费数据
          </p>
        </div>

        {/* 基金类型筛选 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {fundTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedType === type
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 数据说明 */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>数据来源：</strong>AKShare（免费开源）· 东方财富 · 天天基金
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                <strong>实时估值：</strong>基于前十大持仓股票加权计算，交易时间每 5 分钟更新
              </p>
            </div>
          </div>
        </div>

        {/* 基金列表 */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {/* 表头 */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300">
              <div className="col-span-3">基金代码</div>
              <div className="col-span-3">基金名称</div>
              <div className="col-span-2 text-right">单位净值</div>
              <div className="col-span-2 text-right">日涨跌</div>
              <div className="col-span-2 text-right">实时估值</div>
            </div>

            {/* 基金列表 */}
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {funds.map((fund) => (
                <Link
                  key={fund.fund_id}
                  href={`/funds/${fund.fund_id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900 dark:text-white">{fund.fund_id}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900 dark:text-white">{fund.fund_name}</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-gray-900 dark:text-white font-medium">{fund.net_value.toFixed(4)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{fund.nav_date}</div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className={`font-bold ${getGrowthColor(fund.daily_growth)}`}>
                      {formatGrowth(fund.daily_growth)}
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    {estimates[fund.fund_id] !== undefined ? (
                      <div className={`font-bold ${getGrowthColor(estimates[fund.fund_id])}`}>
                        {formatGrowth(estimates[fund.fund_id])}
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 text-sm">--</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* 底部统计 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 text-sm text-gray-600 dark:text-gray-300">
              共 {funds.length} 只基金 · 数据类型：{selectedType}
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
