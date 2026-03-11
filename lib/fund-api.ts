/**
 * 基金数据 API 客户端
 * 免费开源数据源 - AKShare
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_FINANCE_API_URL || 'http://localhost:8000';

export interface Fund {
  fund_id: string;
  fund_name: string;
  net_value: number;
  nav_date: string;
  daily_growth: number;
  estimate_growth?: number;
  total_value?: number;
}

export interface FundHolding {
  stock_code: string;
  stock_name: string;
  percentage: number;
  market_value?: number;
  shares?: number;
}

export interface StockInfo {
  stock_code: string;
  stock_name: string;
  price: number;
  change_percent: number;
  change_amount: number;
  volume: number;
  turnover: number;
  pe_ratio?: number;
  pb_ratio?: number;
}

export interface SentimentAnalysis {
  score: number;
  label: '正面' | '中性' | '负面';
  keywords: string[];
}

/**
 * 获取基金列表
 */
export async function getFundList(
  fundType: string = '混合基金',
  limit: number = 50
): Promise<{ funds: Fund[]; count: number; type: string }> {
  const res = await fetch(`${API_BASE_URL}/api/funds/list?fund_type=${encodeURIComponent(fundType)}&limit=${limit}`);
  if (!res.ok) throw new Error('获取基金列表失败');
  return res.json();
}

/**
 * 获取基金详情
 */
export async function getFundDetail(fundId: string): Promise<Fund> {
  const res = await fetch(`${API_BASE_URL}/api/funds/${fundId}`);
  if (!res.ok) throw new Error('获取基金详情失败');
  return res.json();
}

/**
 * 获取基金持仓
 */
export async function getFundHoldings(fundId: string): Promise<{ fund_id: string; stocks: FundHolding[]; update_date: string }> {
  const res = await fetch(`${API_BASE_URL}/api/funds/${fundId}/holdings`);
  if (!res.ok) throw new Error('获取持仓失败');
  return res.json();
}

/**
 * 获取基金净值历史
 */
export async function getFundNetHistory(fundId: string, days: number = 30): Promise<{ fund_id: string; data: any[] }> {
  const res = await fetch(`${API_BASE_URL}/api/funds/${fundId}/net-history?days=${days}`);
  if (!res.ok) throw new Error('获取净值历史失败');
  return res.json();
}

/**
 * 获取基金实时估值
 */
export async function getFundEstimate(fundId: string): Promise<{ fund_id: string; estimate_growth: number; stocks: any[]; update_time: string }> {
  const res = await fetch(`${API_BASE_URL}/api/funds/${fundId}/estimate`);
  if (!res.ok) throw new Error('获取估值失败');
  return res.json();
}

/**
 * 获取股票行情
 */
export async function getStockInfo(stockCode: string): Promise<StockInfo> {
  const res = await fetch(`${API_BASE_URL}/api/stocks/${stockCode}`);
  if (!res.ok) throw new Error('获取股票行情失败');
  return res.json();
}

/**
 * 获取公司基本面
 */
export async function getCompanyInfo(stockCode: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/stocks/${stockCode}/company`);
  if (!res.ok) throw new Error('获取公司信息失败');
  return res.json();
}

/**
 * 情感分析
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  const res = await fetch(`${API_BASE_URL}/api/news/sentiment?text=${encodeURIComponent(text)}`);
  if (!res.ok) throw new Error('情感分析失败');
  return res.json();
}

/**
 * 基金筛选
 */
export async function screenFunds(
  fundType: string = '混合基金',
  minGrowth: number = 10,
  limit: number = 20
): Promise<{ funds: Fund[]; count: number; criteria: any }> {
  const res = await fetch(`${API_BASE_URL}/api/funds/screen?fund_type=${encodeURIComponent(fundType)}&min_growth=${minGrowth}&limit=${limit}`);
  if (!res.ok) throw new Error('基金筛选失败');
  return res.json();
}
