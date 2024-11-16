'use client'

import { useEffect, useRef } from 'react'
import useSWRInfinite from 'swr/infinite'
import { Loader2 } from 'lucide-react'

// This type definition assumes the API returns an array of items with an id and title
type Item = {
  id: number
  title: string
}

type ApiResponse = {
  items: Item[]
  nextCursor: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function InfiniteLoader() {
  const observerTarget = useRef<HTMLDivElement>(null)

  const getKey = (pageIndex: number, previousPageData: ApiResponse | null) => {
    if (previousPageData && !previousPageData.nextCursor) return null
    if (pageIndex === 0) return '/api/items?limit=10'
    return `/api/items?cursor=${previousPageData?.nextCursor}&limit=10`
  }

  const { data, error, size, setSize } = useSWRInfinite<ApiResponse>(getKey, fetcher)

  const items = data ? data.flatMap((page) => page.items) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined")
  const isEmpty = data?.[0]?.items.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.nextCursor === null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize((prevSize) => prevSize + 1)
        }
      },
      { rootMargin: '100px' }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [isReachingEnd, isLoadingMore, setSize])

  if (error) return <div>Error loading items</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Infinite Loader Example</h1>
      {isEmpty ? (
        <p>No items found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="p-4 bg-gray-100 rounded-lg">
              {item.title}
            </li>
          ))}
        </ul>
      )}
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {isLoadingMore && <Loader2 className="h-6 w-6 animate-spin" />}
      </div>
      {isReachingEnd && <p>No more items to load</p>}
    </div>
  )
}