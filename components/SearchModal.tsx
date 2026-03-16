'use client'

import { useEffect, useState } from 'react'
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from 'cmdk'
import { useRouter } from 'next/navigation'

interface PostResult {
  id: string
  slug: string
  title: string
  summary: string
  category: string
}

interface StockResult {
  code: string
  name: string
  price?: number
  changePercent?: number
}

export default function SearchModal() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<PostResult[]>([])
  const [stocks, setStocks] = useState<StockResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        performSearch(search)
      } else {
        setPosts([])
        setStocks([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  async function performSearch(query: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setPosts(data.posts || [])
      setStocks(data.stocks || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="搜索文章、股票、标签..."
      />
      <CommandList>
        <CommandEmpty>
          {loading ? '搜索中...' : '未找到结果'}
        </CommandEmpty>
        {posts.length > 0 && (
          <CommandGroup heading="📝 文章">
            {posts.map((post) => (
              <CommandItem
                key={post.id}
                value={post.title}
                onSelect={() => {
                  router.push(`/blog/${post.slug}`)
                  setOpen(false)
                }}
              >
                📝 {post.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {stocks.length > 0 && (
          <CommandGroup heading="📈 股票">
            {stocks.map((stock) => (
              <CommandItem
                key={stock.code}
                value={`${stock.code} ${stock.name}`}
                onSelect={() => {
                  router.push(`/stocks/${stock.code}`)
                  setOpen(false)
                }}
              >
                📈 {stock.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
