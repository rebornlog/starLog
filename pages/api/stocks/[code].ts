import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { code } = req.query
    const response = await fetch(`http://localhost:8081/api/stocks/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return res.status(response.status).json({ error: '股票数据获取失败' })
    }
    
    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Stock Detail API Error:', error)
    return res.status(503).json({ error: 'API 服务不可用' })
  }
}
