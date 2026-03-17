interface FundManagerProps {
  name: string
  company?: string
  experience?: string
  manageDate?: string
  returnRate?: string
  otherFunds?: Array<{ code: string; name: string }>
}

export default function FundManagerCard({ 
  name, 
  company,
  experience = '-',
  manageDate = '-',
  returnRate = '-',
  otherFunds = []
}: FundManagerProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{company || '基金经理'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">从业年限</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{experience}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">任职日期</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{manageDate}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">任职回报</p>
          <p className={`text-lg font-bold ${
            returnRate.startsWith('-') ? 'text-green-500' : 'text-red-500'
          }`}>{returnRate}</p>
        </div>
      </div>

      {otherFunds.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            管理其他基金
          </p>
          <div className="flex flex-wrap gap-2">
            {otherFunds.map(fund => (
              <span
                key={fund.code}
                className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-gray-600"
              >
                {fund.name} ({fund.code})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
