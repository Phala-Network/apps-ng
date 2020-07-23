import dynamic from 'next/dynamic'
import PageLoading from '@/components/PageLoading'
import { useMemo } from 'react'

export const isDynamicSymbol = Symbol('isDynamic')

export const LAYOUT_ROUTE = '/[...slug]'

export const DEFAULT_ROUTE = '/wallet'

export const _findRouteComponent = (source, [ first, ...rest ]) => {
  const next = source[first]

  if (!next) {
    return null
  }

  if (typeof next === 'function') {
    if (next.prototype.then) {
      return dynamic(next, {
        loading: PageLoading
      })
    }
    return next
  }

  return _findRouteComponent(next, rest)
}

export const useUrlParams = () => useMemo(() => new URLSearchParams(window?.location?.search || ''), [window?.location?.search])
