import { useState, useCallback, useRef, useEffect } from 'react'

interface LoadingState {
  [key: string]: boolean
}

export function useOptimizedLoading() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})
  const loadingCountRef = useRef(0)

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => {
      const newState = { ...prev, [key]: isLoading }
      
      // Count active loading states
      const activeCount = Object.values(newState).filter(Boolean).length
      loadingCountRef.current = activeCount
      
      return newState
    })
  }, [])

  const isLoading = useCallback((key?: string) => {
    if (key) return loadingStates[key] || false
    return loadingCountRef.current > 0
  }, [loadingStates])

  const isAnyLoading = loadingCountRef.current > 0

  return {
    setLoading,
    isLoading,
    isAnyLoading
  }
}

export function useDebounceLoading(delay: number = 300) {
  const [loading, setLoadingState] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const setLoading = useCallback((isLoading: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isLoading) {
      // Show loading immediately
      setLoadingState(true)
    } else {
      // Debounce hiding loading to prevent flicker
      timeoutRef.current = setTimeout(() => {
        setLoadingState(false)
      }, delay)
    }
  }, [delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { loading, setLoading }
}