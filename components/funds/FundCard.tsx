'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/animations'
import Link from 'next/link'

interface Fund {
  code: string
  name: string
  value: number
  change: number
  changePercent: number
}

interface FundCardProps {
  fund: Fund
  delay?: number
}

export function FundCard({ fund, delay = 0 }: FundCardProps) {
  const isPositive = fund.change >= 0

  return (
    <FadeIn delay={delay}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">{fund.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{fund.code}</p>
            </div>
            <Link href={`/funds/${fund.code}`}>
              <Button variant="outline" size="sm">
                详情
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">{fund.value.toFixed(4)}</div>
              <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{fund.change.toFixed(2)} ({isPositive ? '+' : ''}{fund.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              实时净值
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  )
}

export function FundSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </CardContent>
    </Card>
  )
}
