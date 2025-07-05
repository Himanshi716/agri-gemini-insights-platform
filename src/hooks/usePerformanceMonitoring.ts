import { useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

interface ErrorEvent {
  message: string
  source: string
  lineno: number
  colno: number
  error: Error
}

export function usePerformanceMonitoring() {
  const reportMetrics = useCallback((metrics: PerformanceMetrics) => {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        Object.entries(metrics).forEach(([key, value]) => {
          if (value !== undefined) {
            window.gtag('event', 'timing_complete', {
              name: key,
              value: Math.round(value),
            })
          }
        })
      }
    } else {
      console.log('Performance Metrics:', metrics)
    }
  }, [])

  const reportError = useCallback((error: ErrorEvent) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Runtime Error:', error)
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false,
        })
      }
    }
  }, [])

  useEffect(() => {
    // Measure Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const metrics: PerformanceMetrics = {}

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcp) {
          metrics.fcp = fcp.startTime
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          metrics.lcp = lastEntry.startTime
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.name === 'first-input') {
            metrics.fid = entry.processingStart - entry.startTime
          }
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        metrics.cls = clsValue
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Navigation Timing for TTFB
      if ('navigation' in performance) {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigationEntry) {
          metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        }
      }

      // Report metrics after page load
      const timeout = setTimeout(() => {
        reportMetrics(metrics)
      }, 5000)

      return () => {
        clearTimeout(timeout)
        fcpObserver.disconnect()
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }, [reportMetrics])

  useEffect(() => {
    // Global error handler
    const handleError = (event: any) => {
      reportError({
        message: event.message,
        source: event.filename || '',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        error: event.error,
      })
    }

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        source: 'Promise',
        lineno: 0,
        colno: 0,
        error: new Error(event.reason),
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [reportError])

  return {
    reportMetrics,
    reportError,
  }
}

export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  usePerformanceMonitoring()
  return children as React.ReactElement
}