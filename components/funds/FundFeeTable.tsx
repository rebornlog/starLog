interface FundFeeProps {
  purchaseFee?: string
  redemptionFee?: string
  managementFee?: string
  custodyFee?: string
  serviceFee?: string
}

export default function FundFeeTable({ 
  purchaseFee = '1.50%',
  redemptionFee = '0.50%',
  managementFee = '1.50%',
  custodyFee = '0.25%',
  serviceFee = '0.50%'
}: FundFeeProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        💰 基金费率
      </h3>
      
      <div className="space-y-4">
        {/* 交易费用 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            交易费用（一次性）
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">申购费率</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{purchaseFee}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                买入时收取，不同金额阶梯费率
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">赎回费率</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{redemptionFee}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                卖出时收取，持有时间越长费率越低
              </p>
            </div>
          </div>
          
          {/* 费率阶梯 */}
          <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">申购费率阶梯：</p>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>100 万以下</span>
                <span>1.50%</span>
              </div>
              <div className="flex justify-between">
                <span>100 万 -500 万</span>
                <span>1.00%</span>
              </div>
              <div className="flex justify-between">
                <span>500 万 -1000 万</span>
                <span>0.50%</span>
              </div>
              <div className="flex justify-between">
                <span>1000 万以上</span>
                <span>1000 元/笔</span>
              </div>
            </div>
          </div>
        </div>

        {/* 运营费用 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            运营费用（每日计提）
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">管理费</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">支付给基金公司的管理费用</p>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{managementFee}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">托管费</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">支付给银行的资金托管费用</p>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{custodyFee}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">销售服务费</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">C 类份额收取的销售服务费用</p>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{serviceFee}</span>
            </div>
          </div>
        </div>

        {/* 费率说明 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            💡 <strong>费率说明：</strong>
          </p>
          <ul className="mt-2 space-y-1 text-xs text-yellow-600 dark:text-yellow-500">
            <li>• 交易费用在买卖时一次性收取</li>
            <li>• 运营费用每日从基金资产中计提，已反映在净值中</li>
            <li>• 持有时间越长，赎回费率越低（通常持有 2 年以上免赎回费）</li>
            <li>• C 类份额免申购费，但收取销售服务费，适合短期持有</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
