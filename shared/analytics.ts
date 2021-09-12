import { Analytics, getAnalytics, setCurrentScreen, logEvent } from '@firebase/analytics'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { app } from './firebase'

type AnalyticsHandler = (analytics: Analytics) => void

const analytics = (): Analytics => getAnalytics(app)

function canLoad(): boolean {
  return false
  return typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
}

function withAnalytics(handler: AnalyticsHandler): void {
  if (canLoad()) {
    return handler(analytics())
  }
}

function usePageEvent(): void {
  const router = useRouter()
  useEffect(() => {
    if (canLoad()) {
      const log = (url): void => {
        setCurrentScreen(analytics(), url)
        logEvent(analytics(), 'screen_view')
      }

      router.events.on('routeChangeComplete', log)
      log(router.pathname)

      return () => {
        router.events.off('routeChangeComplete', log)
      }
    }
  }, [router.events, router.pathname])
}

export { analytics, withAnalytics, usePageEvent, logEvent }
