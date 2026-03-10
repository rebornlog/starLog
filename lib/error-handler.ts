/**
 * 统一错误处理工具
 * 水镜先生 - starLog
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  DATABASE = 'DATABASE_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * 友好的错误消息映射
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: '网络连接失败，请检查网络后重试',
  [ErrorType.DATABASE]: '数据加载失败，请稍后重试',
  [ErrorType.VALIDATION]: '输入数据有误，请检查后重试',
  [ErrorType.NOT_FOUND]: '请求的内容不存在',
  [ErrorType.UNAUTHORIZED]: '请先登录后再访问',
  [ErrorType.SERVER]: '服务器开小差了，请稍后重试',
  [ErrorType.UNKNOWN]: '发生了一个意外错误，请稍后重试',
}

/**
 * 判断错误类型
 */
export function getErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN
  
  // 网络错误
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return ErrorType.NETWORK
  }
  
  // 数据库错误
  if (error.message?.includes('database') || error.message?.includes('prisma')) {
    return ErrorType.DATABASE
  }
  
  // 404 错误
  if (error.status === 404 || error.message?.includes('404')) {
    return ErrorType.NOT_FOUND
  }
  
  // 401 错误
  if (error.status === 401 || error.message?.includes('401')) {
    return ErrorType.UNAUTHORIZED
  }
  
  // 500 错误
  if (error.status === 500) {
    return ErrorType.SERVER
  }
  
  // 验证错误
  if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    return ErrorType.VALIDATION
  }
  
  return ErrorType.UNKNOWN
}

/**
 * 获取友好的错误消息
 */
export function getFriendlyMessage(error: any): string {
  const errorType = getErrorType(error)
  return ERROR_MESSAGES[errorType]
}

/**
 * 记录错误日志（可扩展为发送到错误监控服务）
 */
export function logError(error: Error, context?: {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}) {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  })
  
  // TODO: 集成 Sentry 或其他错误监控服务
  // 可以在这里添加发送错误到监控服务的逻辑
}

/**
 * 安全执行异步函数，捕获错误
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    console.error('safeExecute error:', error)
    logError(error as Error, { action: 'safeExecute' })
    return fallback
  }
}

/**
 * 错误恢复策略
 */
export interface RetryOptions {
  maxRetries?: number
  delayMs?: number
  backoff?: 'linear' | 'exponential'
}

/**
 * 带重试的执行
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = 'exponential',
  } = options

  let lastError: any
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) {
        break
      }
      
      // 等待后重试
      const delay = backoff === 'exponential' 
        ? delayMs * Math.pow(2, i) 
        : delayMs * (i + 1)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}
