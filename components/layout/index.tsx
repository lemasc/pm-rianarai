import { useAuth } from '@/shared/authContext'
import AuthSpinner from '@/components/auth/spinner'
import { ReactNodeArray, useEffect, useRef, useState } from 'react'
import Sidebar from 'react-sidebar'
import MenuBarComponent, { SidebarComponent } from './menubar'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { useRouter } from 'next/router'

export const HEADER = 'pt-8 md:text-4xl text-3xl'

type LayoutProps = {
  children: ReactNodeArray | JSX.Element
}
const isMobile = false

export default function LayoutComponent({ children }: LayoutProps): JSX.Element {
  const scrollbars = useRef<Scrollbars>()
  const router = useRouter()
  const { ready, metadata, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarDocked, setSidebarDocked] = useState(!isMobile)

  useEffect(() => {
    const handleRouteChange = () => {
      scrollbars.current?.scrollToTop()
      setSidebarOpen(false)
    }
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: 1024px)`)
    const setDock = () => {
      if (!user) return
      setSidebarDocked(mql.matches)
      mql.matches && setSidebarOpen(false)
    }
    setDock()
    mql.addEventListener('change', setDock)
    return () => mql.removeEventListener('change', setDock)
  }, [user])
  return (
    <>
      <AuthSpinner />
      <Sidebar
        docked={metadata && sidebarDocked}
        sidebar={
          <>
            <SidebarComponent />
          </>
        }
        open={ready && metadata && sidebarOpen}
        onSetOpen={setSidebarOpen}
        rootClassName="flex flex-row select-none"
        sidebarClassName="bg-rianarai-200 h-screen flex flex-col md:px-4 py-4 gap-6 items-center"
        contentClassName={`flex flex-col ${metadata ? 'border-t ' : ''}overflow-hidden select-none`}
      >
        <MenuBarComponent docked={sidebarDocked} open={sidebarOpen} setOpen={setSidebarOpen} />
        <Scrollbars ref={scrollbars} universal>
          {ready && (
            <main
              className={
                metadata
                  ? 'flex flex-1 flex-col lg:px-14 md:px-10 px-6 lg:py-4 w-full md:space-y-8 space-y-6 mb-20'
                  : undefined
              }
            >
              {children}
            </main>
          )}
        </Scrollbars>
      </Sidebar>
    </>
  )
}
