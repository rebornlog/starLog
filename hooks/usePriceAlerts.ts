'use client'

import { useState, useEffect } from 'react'

export interface PriceAlert {
  id: string
  fundCode: string
  fundName: string
  type: 'above' | 'below'  // above: 高于目标价，below: 低于目标价
  targetPrice: number
  currentPrice: number
  enabled: boolean
  createdAt: string
  triggeredAt?: string
}

const STORAGE_KEY = 'starlog_price_alerts'

/**
 * 价格提醒 Hook
 * 支持设置基金净值涨跌提醒，使用 localStorage 持久化存储
 */
export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 加载提醒列表
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setAlerts(parsed)
        }
      }
    } catch (error) {
      console.error('加载价格提醒失败:', error)
    }
    setIsLoaded(true)
  }, [])

  // 保存提醒列表
  const saveAlerts = (newAlerts: PriceAlert[]) => {
    try {
      setAlerts(newAlerts)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlerts))
    } catch (error) {
      console.error('保存价格提醒失败:', error)
    }
  }

  // 添加提醒
  const addAlert = (fundCode: string, fundName: string, type: 'above' | 'below', targetPrice: number, currentPrice: number): PriceAlert => {
    const alert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fundCode,
      fundName,
      type,
      targetPrice,
      currentPrice,
      enabled: true,
      createdAt: new Date().toISOString()
    }
    saveAlerts([...alerts, alert])
    return alert
  }

  // 删除提醒
  const removeAlert = (id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id))
  }

  // 启用/禁用提醒
  const toggleAlert = (id: string) => {
    saveAlerts(alerts.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ))
  }

  // 更新当前价格并检查是否触发
  const updatePrice = (fundCode: string, newPrice: number) => {
    const triggeredAlerts: PriceAlert[] = []
    
    const updatedAlerts = alerts.map(alert => {
      if (!alert.enabled || alert.fundCode !== fundCode) {
        return { ...alert, currentPrice: newPrice }
      }

      // 检查是否触发
      const isTriggered = 
        (alert.type === 'above' && newPrice >= alert.targetPrice) ||
        (alert.type === 'below' && newPrice <= alert.targetPrice)

      if (isTriggered && !alert.triggeredAt) {
        triggeredAlerts.push({
          ...alert,
          currentPrice: newPrice,
          triggeredAt: new Date().toISOString()
        })
        return {
          ...alert,
          currentPrice: newPrice,
          triggeredAt: new Date().toISOString()
        }
      }

      return { ...alert, currentPrice: newPrice }
    })

    if (triggeredAlerts.length > 0) {
      saveAlerts(updatedAlerts)
    } else {
      setAlerts(updatedAlerts)
    }

    return triggeredAlerts
  }

  // 清除已触发的提醒
  const clearTriggered = () => {
    saveAlerts(alerts.filter(a => !a.triggeredAt))
  }

  // 清空所有提醒
  const clearAll = () => {
    saveAlerts([])
  }

  // 获取启用的提醒数量
  const enabledCount = alerts.filter(a => a.enabled).length
  const triggeredCount = alerts.filter(a => a.triggeredAt).length

  return {
    alerts,
    isLoaded,
    addAlert,
    removeAlert,
    toggleAlert,
    updatePrice,
    clearTriggered,
    clearAll,
    enabledCount,
    triggeredCount
  }
}
