// data/funds.ts - 首批热门基金数据
import { Fund } from '@/types/fund'

export const funds: Fund[] = [
  // 股票型基金
  {
    code: '005827',
    name: '易方达蓝筹精选混合',
    type: '股票型',
    company: '易方达基金',
    manager: '张坤',
    netValue: 1.234,
    change: 0.012,
    changePercent: 0.98,
    scale: 100,
    riskLevel: '中高',
    tags: ['消费', '蓝筹', '热门']
  },
  {
    code: '003096',
    name: '中欧医疗健康混合 A',
    type: '股票型',
    company: '中欧基金',
    manager: '葛兰',
    netValue: 2.156,
    change: -0.023,
    changePercent: -1.06,
    scale: 300,
    riskLevel: '高',
    tags: ['医疗', '热门']
  },
  {
    code: '260108',
    name: '景顺长城新兴成长混合',
    type: '股票型',
    company: '景顺长城基金',
    manager: '刘彦春',
    netValue: 3.421,
    change: 0.034,
    changePercent: 1.00,
    scale: 400,
    riskLevel: '中高',
    tags: ['成长', '蓝筹']
  },
  {
    code: '161725',
    name: '招商中证白酒指数',
    type: '指数型',
    company: '招商基金',
    netValue: 1.089,
    change: 0.015,
    changePercent: 1.40,
    scale: 500,
    riskLevel: '中高',
    tags: ['白酒', '指数', '热门']
  },
  {
    code: '110011',
    name: '易方达中小盘混合',
    type: '股票型',
    company: '易方达基金',
    manager: '张坤',
    netValue: 5.678,
    change: 0.045,
    changePercent: 0.80,
    scale: 200,
    riskLevel: '中高',
    tags: ['中小盘', '成长']
  },
  {
    code: '007119',
    name: '睿远成长价值混合 A',
    type: '股票型',
    company: '睿远基金',
    manager: '傅鹏博',
    netValue: 1.567,
    change: 0.012,
    changePercent: 0.77,
    scale: 350,
    riskLevel: '中高',
    tags: ['成长', '价值']
  },
  {
    code: '000083',
    name: '汇添富消费行业混合',
    type: '股票型',
    company: '汇添富基金',
    manager: '胡昕炜',
    netValue: 2.345,
    change: 0.028,
    changePercent: 1.21,
    scale: 180,
    riskLevel: '中高',
    tags: ['消费']
  },
  {
    code: '001938',
    name: '中欧时代先锋股票 A',
    type: '股票型',
    company: '中欧基金',
    manager: '周应波',
    netValue: 1.876,
    change: 0.019,
    changePercent: 1.02,
    scale: 150,
    riskLevel: '高',
    tags: ['科技', '成长']
  },
  {
    code: '005828',
    name: '易方达消费行业股票',
    type: '股票型',
    company: '易方达基金',
    netValue: 3.234,
    change: 0.041,
    changePercent: 1.28,
    scale: 120,
    riskLevel: '中高',
    tags: ['消费']
  },
  {
    code: '001763',
    name: '广发多因子混合',
    type: '股票型',
    company: '广发基金',
    manager: '唐晓斌',
    netValue: 2.567,
    change: 0.023,
    changePercent: 0.90,
    scale: 100,
    riskLevel: '中高',
    tags: ['多因子', '量化']
  },

  // 混合型基金
  {
    code: '166002',
    name: '中欧新蓝筹混合 A',
    type: '混合型',
    company: '中欧基金',
    netValue: 1.789,
    change: 0.015,
    changePercent: 0.85,
    scale: 80,
    riskLevel: '中',
    tags: ['蓝筹', '稳健']
  },
  {
    code: '000041',
    name: '富国天惠成长混合 A',
    type: '混合型',
    company: '富国基金',
    manager: '朱少醒',
    netValue: 2.987,
    change: 0.032,
    changePercent: 1.08,
    scale: 300,
    riskLevel: '中高',
    tags: ['成长', '老牌']
  },
  {
    code: '001513',
    name: '易方达信息产业混合',
    type: '混合型',
    company: '易方达基金',
    netValue: 1.654,
    change: 0.018,
    changePercent: 1.10,
    scale: 60,
    riskLevel: '中高',
    tags: ['科技', '信息']
  },
  {
    code: '001664',
    name: '平安安享保本混合',
    type: '混合型',
    company: '平安基金',
    netValue: 1.234,
    change: 0.005,
    changePercent: 0.41,
    scale: 40,
    riskLevel: '中低',
    tags: ['保本', '稳健']
  },
  {
    code: '001869',
    name: '招商制造业股票 A',
    type: '混合型',
    company: '招商基金',
    netValue: 1.876,
    change: 0.021,
    changePercent: 1.13,
    scale: 50,
    riskLevel: '中高',
    tags: ['制造', '高端']
  },

  // 债券型基金
  {
    code: '000171',
    name: '易方达裕丰回报债券',
    type: '债券型',
    company: '易方达基金',
    netValue: 1.567,
    change: 0.002,
    changePercent: 0.13,
    scale: 200,
    riskLevel: '低',
    tags: ['债券', '稳健']
  },
  {
    code: '000342',
    name: '嘉实新兴市场债券 A2',
    type: '债券型',
    company: '嘉实基金',
    netValue: 1.123,
    change: 0.001,
    changePercent: 0.09,
    scale: 100,
    riskLevel: '中低',
    tags: ['债券', '海外']
  },
  {
    code: '000727',
    name: '华夏恒利 3 个月债券',
    type: '债券型',
    company: '华夏基金',
    netValue: 1.089,
    change: 0.001,
    changePercent: 0.09,
    scale: 80,
    riskLevel: '低',
    tags: ['债券', '短期']
  },
  {
    code: '000832',
    name: '理财宝 A',
    type: '债券型',
    company: '华夏基金',
    netValue: 1.234,
    change: 0.001,
    changePercent: 0.08,
    scale: 150,
    riskLevel: '低',
    tags: ['理财', '稳健']
  },
  {
    code: '000914',
    name: '中加纯债债券',
    type: '债券型',
    company: '中加基金',
    netValue: 1.078,
    change: 0.001,
    changePercent: 0.09,
    scale: 60,
    riskLevel: '低',
    tags: ['纯债']
  },

  // QDII 基金
  {
    code: '000055',
    name: '广发纳斯达克 100ETF 联接',
    type: 'QDII',
    company: '广发基金',
    netValue: 2.345,
    change: 0.028,
    changePercent: 1.21,
    scale: 100,
    riskLevel: '高',
    tags: ['美股', '科技', '纳指']
  },
  {
    code: '000614',
    name: '华安德国 30ETF 联接',
    type: 'QDII',
    company: '华安基金',
    netValue: 1.234,
    change: 0.008,
    changePercent: 0.65,
    scale: 30,
    riskLevel: '中高',
    tags: ['德股', '欧洲']
  },
  {
    code: '000988',
    name: '华宝标普油气上游股票',
    type: 'QDII',
    company: '华宝基金',
    netValue: 0.876,
    change: -0.012,
    changePercent: -1.35,
    scale: 50,
    riskLevel: '高',
    tags: ['油气', '能源']
  },

  // 指数型基金
  {
    code: '510300',
    name: '华泰柏瑞沪深 300ETF',
    type: '指数型',
    company: '华泰柏瑞基金',
    netValue: 3.456,
    change: 0.023,
    changePercent: 0.67,
    scale: 800,
    riskLevel: '中',
    tags: ['沪深 300', '大盘', 'ETF']
  },
  {
    code: '510500',
    name: '南方中证 500ETF',
    type: '指数型',
    company: '南方基金',
    netValue: 5.678,
    change: 0.045,
    changePercent: 0.80,
    scale: 600,
    riskLevel: '中高',
    tags: ['中证 500', '中盘', 'ETF']
  },
  {
    code: '159915',
    name: '易方达创业板 ETF',
    type: '指数型',
    company: '易方达基金',
    netValue: 2.123,
    change: 0.034,
    changePercent: 1.63,
    scale: 400,
    riskLevel: '高',
    tags: ['创业板', '成长', 'ETF']
  },
  {
    code: '513050',
    name: '易方达中证海外互联 ETF',
    type: '指数型',
    company: '易方达基金',
    netValue: 1.234,
    change: 0.019,
    changePercent: 1.56,
    scale: 300,
    riskLevel: '高',
    tags: ['中概股', '海外', 'ETF']
  },
  {
    code: '512880',
    name: '国泰中证全指证券公司 ETF',
    type: '指数型',
    company: '国泰基金',
    netValue: 0.987,
    change: 0.012,
    changePercent: 1.23,
    scale: 200,
    riskLevel: '高',
    tags: ['券商', '金融', 'ETF']
  },

  // 货币基金
  {
    code: '000198',
    name: '易方达天天理财货币 A',
    type: '货币型',
    company: '易方达基金',
    netValue: 1.000,
    change: 0.0001,
    changePercent: 0.01,
    scale: 1000,
    riskLevel: '低',
    tags: ['货币', '现金管理']
  },
  {
    code: '000620',
    name: '华夏现金增利货币 A',
    type: '货币型',
    company: '华夏基金',
    netValue: 1.000,
    change: 0.0001,
    changePercent: 0.01,
    scale: 800,
    riskLevel: '低',
    tags: ['货币', '现金管理']
  },
  {
    code: '000686',
    name: '博时现金宝货币 A',
    type: '货币型',
    company: '博时基金',
    netValue: 1.000,
    change: 0.0001,
    changePercent: 0.01,
    scale: 600,
    riskLevel: '低',
    tags: ['货币', '现金管理']
  }
]

export default funds
