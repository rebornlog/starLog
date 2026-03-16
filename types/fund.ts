// types/fund.ts
export interface Fund {
  code: string          // 基金代码
  name: string          // 基金名称
  type: FundType        // 基金类型
  company: string       // 基金公司
  manager?: string      // 基金经理
  netValue: number      // 当前净值
  change: number        // 涨跌额
  changePercent: number // 涨跌幅
  scale?: number        // 规模（亿）
  riskLevel: RiskLevel  // 风险等级
  establishDate?: string // 成立日期
  tags?: string[]       // 标签
}

export type FundType = '股票型' | '债券型' | '混合型' | '货币型' | 'QDII' | '指数型' | 'FOF'
export type RiskLevel = '低' | '中低' | '中' | '中高' | '高'

export interface FundHolding {
  name: string    // 持仓名称
  code: string    // 持仓代码
  percent: number // 占比
  type: '股票' | '债券' | '现金' | '其他'
}

export interface FundPerformance {
  oneMonth: number
  threeMonth: number
  sixMonth: number
  oneYear: number
  threeYear: number
  fiveYear: number
  sinceEstablishment: number
}

export interface FundDetail extends Fund {
  holdings?: FundHolding[]
  performance?: FundPerformance
  description?: string
}

// 导入导出格式
export interface FundImportData {
  code: string
  name?: string
  notes?: string
}
