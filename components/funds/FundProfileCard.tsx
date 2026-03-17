interface FundProfileProps {
  establishDate?: string
  fundSize?: string
  minPurchase?: string
  fundType?: string
  riskLevel?: string
  purchaseStatus?: 'open' | 'closed' | 'limit'
  dividendOption?: string
  fundCode?: string
  manager?: string
  company?: string
}

export default function FundProfileCard({ 
  establishDate = '-',
  fundSize = '-',
  minPurchase = '10 元',
  fundType = '混合型',
  riskLevel = '中高',
  purchaseStatus = 'open',
  dividendOption = '现金分红/红利再投资',
  fundCode,
  manager,
  company
}: FundProfileProps) {
  const statusConfig = {
    open: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', text: '开放申购' },
    closed: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', text: '暂停申购' },
    limit: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', text: '限额申购' }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📋 基金档案
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 成立日期 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">成立日期</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{establishDate}</p>
        </div>

        {/* 基金规模 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">基金规模</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{fundSize}</p>
        </div>

        {/* 最低申购 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">最低申购</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{minPurchase}</p>
        </div>

        {/* 基金类型 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">基金类型</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{fundType}</p>
        </div>

        {/* 风险等级 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">风险等级</p>
          <p className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
            riskLevel === '低' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
            riskLevel === '中低' ? 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300' :
            riskLevel === '中' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
            riskLevel === '中高' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {riskLevel}
          </p>
        </div>

        {/* 申购状态 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">申购状态</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            statusConfig[purchaseStatus].color
          }`}>
            {statusConfig[purchaseStatus].text}
          </span>
        </div>

        {/* 基金公司 */}
        {company && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">基金公司</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{company}</p>
          </div>
        )}

        {/* 基金经理 */}
        {manager && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">基金经理</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{manager}</p>
          </div>
        )}

        {/* 分红方式 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">分红方式</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{dividendOption}</p>
        </div>
      </div>

      {/* 基金代码 */}
      {fundCode && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">基金代码：</span>
            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{fundCode}</span>
          </div>
        </div>
      )}
    </div>
  )
}
