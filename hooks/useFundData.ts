import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// 基金列表 SWR 配置
export function useFundList(fundType: string = 'all', limit: number = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `http://localhost:8081/api/funds/list?fund_type=${fundType}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 分钟自动刷新
      dedupingInterval: 60000, // 1 分钟内重复请求去重
      revalidateOnFocus: false, // 窗口聚焦时不刷新
      revalidateOnReconnect: true, // 网络重连时刷新
      keepPreviousData: true, // 保留上次数据
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // 最多重试 3 次
        if (retryCount >= 3) return
        // 5 秒后重试
        setTimeout(() => revalidate({ retryCount }), 5000)
      }
    }
  )

  return {
    funds: data?.funds || [],
    loading: isLoading,
    error,
    refresh: mutate
  }
}

// 基金详情 SWR 配置
export function useFundDetail(code: string) {
  const { data, error, isLoading, mutate } = useSWR(
    code ? `http://localhost:8081/api/funds/${code}` : null,
    fetcher,
    {
      refreshInterval: 60000, // 1 分钟自动刷新
      dedupingInterval: 30000, // 30 秒去重
      keepPreviousData: true
    }
  )

  return {
    fund: data?.data || null,
    loading: isLoading,
    error,
    refresh: mutate
  }
}

// 基金历史 SWR 配置
export function useFundHistory(code: string, page: number = 1, size: number = 60) {
  const { data, error, isLoading, mutate } = useSWR(
    code ? `http://localhost:8081/api/funds/${code}/history?page=${page}&size=${size}` : null,
    fetcher,
    {
      refreshInterval: false, // 历史数据不自动刷新
      dedupingInterval: 3600000, // 1 小时去重
      keepPreviousData: true
    }
  )

  return {
    history: data?.data || [],
    loading: isLoading,
    error,
    refresh: mutate
  }
}
