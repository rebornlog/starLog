import { NextResponse } from 'next/server'

const POPULAR_STOCKS = [
  { code: '600519', name: '贵州茅台' },
  { code: '000858', name: '五粮液' },
  { code: '000568', name: '泸州老窖' },
  { code: '600809', name: '山西汾酒' },
  { code: '002304', name: '洋河股份' },
  { code: '600036', name: '招商银行' },
  { code: '600030', name: '中信证券' },
  { code: '600000', name: '浦发银行' },
  { code: '000001', name: '平安银行' },
  { code: '601318', name: '中国平安' },
  { code: '600276', name: '恒瑞医药' },
  { code: '600031', name: '三一重工' },
  { code: '000333', name: '美的集团' },
  { code: '000651', name: '格力电器' },
  { code: '000002', name: '万科 A' },
  { code: '600028', name: '中国石化' },
  { code: '601857', name: '中国石油' },
  { code: '601398', name: '工商银行' },
  { code: '601939', name: '建设银行' },
  { code: '002415', name: '海康威视' },
  { code: '002230', name: '科大讯飞' },
  { code: '300059', name: '东方财富' },
  { code: '601888', name: '中国中免' },
  { code: '600900', name: '长江电力' },
  { code: '601012', name: '隆基股份' },
  { code: '300750', name: '宁德时代' },
  { code: '002594', name: '比亚迪' },
  { code: '600588', name: '用友网络' },
  { code: '600048', name: '保利发展' },
  { code: '601166', name: '兴业银行' },
]

export async function GET() {
  return NextResponse.json(POPULAR_STOCKS)
}
