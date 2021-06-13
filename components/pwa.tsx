import { useAuth } from '../shared/authContext'
import { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import LogRocket from 'logrocket'
import { useWindowWidth } from '@react-hook/window-size/throttled'

type PWAPromoProps = {
  show: boolean
}
export default function PWAPromo({ show }: PWAPromoProps): JSX.Element {
  const auth = useAuth()
  const width = useWindowWidth()
  const [prompt, setPWAPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)
  const [promo, showPromo] = useState(false)
  const PWA_PROMO = 'pwaPrompt'
  const PWA_LOCAL = 'lastPWA'
  useEffect(() => {
    const pwa = (e: Event): void => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setPWAPrompt(e)
      LogRocket.track('PWA Native Shown')
    }
    const installed = (): void => {
      // Hide the app-provided install promotion
      setPWAPrompt(null)
      showPromo(false)
      LogRocket.track('PWA Native Installed')
    }
    window.addEventListener('appinstalled', installed)
    window.addEventListener('beforeinstallprompt', pwa)
    return () => {
      window.removeEventListener('beforeinstallprompt', pwa)
      window.removeEventListener('appinstalled', installed)
    }
  })
  useEffect(() => {
    if (auth.isPWA()) {
      showPromo(false)
      return
    } else if (localStorage.getItem(PWA_LOCAL)) {
      // PWA last session detected, if user open with-in 3 days
      // Change button to OPEN APP
      const time = parseInt(localStorage.getItem(PWA_LOCAL))
      const dateToRemind = new Date(time)
      dateToRemind.setDate(dateToRemind.getDate() + 3)
      if (new Date(time) <= dateToRemind) {
        setInstalled(true)
      }
    } else if (localStorage.getItem(PWA_PROMO)) {
      const time = parseInt(localStorage.getItem(PWA_PROMO))
      const dateToRemind = new Date(time)
      // If past 3 days, re-remind
      dateToRemind.setDate(dateToRemind.getDate() + 3)
      if (new Date(time) <= dateToRemind) return
    }
    setTimeout(() => showPromo(true), 2000)
  }, [auth])
  function installOrOpenPWA(): void {
    LogRocket.track('PWA Promo Clicked')
    if (prompt !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(prompt as any).prompt()
    } else {
      // iOS devices doesn't support native prompt
      // Redirect to instructions instead.
      ;(document.querySelector('#pwamore') as HTMLButtonElement).click()
    }
  }
  function dismissPWA(): void {
    showPromo(false)
    LogRocket.track('PWA Promo Dismissed')
    localStorage.setItem(PWA_PROMO, new Date().valueOf().toString())
  }
  function generateClass(large): string {
    const baseClass =
      'fixed bottom-0 text-sm flex-row flex items-center justify-center bg-purple-600 bg-opacity-90 text-white shadow-2xl'
    if (large) return baseClass + ' mb-8 space-y-0 space-x-4 p-4 rounded-lg'
    return baseClass + ' w-full px-6 py-4 rounded-t-lg'
  }
  return (
    <Transition
      show={promo && auth.metadata != null && show}
      enter="transition duration-700 delay-1000"
      enterFrom="opacity-0"
      enterTo="opactity-100"
      leave="transition duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className={generateClass(width >= 700)}
    >
      <>
        <div className="flex flex-col flex-grow sm:flex-grow-0">
          <h2 className={'text-xl py-1' + (width >= 700 ? ' text-center' : '')}>รู้มั้ย?</h2>
          <span className="font-light py-1">
            สามารถติดตั้งแอปพลิเคชั่นเพื่อให้เข้าใช้งานได้เร็วขึ้นด้วยนะ
          </span>
        </div>
        <div className="flex sm:flex-grow flex-col sm:flex-row px-4 space-y-3 sm:space-y-0 sm:space-x-4 items-center justify-end">
          <button
            onClick={() => installOrOpenPWA()}
            className="w-24 text-black px-4 py-2 bg-gray-100 from-gray-100 to-gray-200 focus:bg-gradient-to-b hover:bg-gradient-to-b focus:outline-none rounded"
          >
            {installed ? 'เปิดในแอพ' : 'ติดตั้งเลย'}
          </button>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={'/install' + (installed ? '#open' : '')}
            id="pwamore"
            className="text-sm font-normal underline"
          >
            เรียนรู้เพิ่มเติม
          </a>
        </div>

        <button
          aria-label="Close"
          name="close"
          onClick={() => dismissPWA()}
          className="focus:outline-none w-8 flex justify-center"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </>
    </Transition>
  )
}
