import { useAuth } from '../shared/authContext'
import { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import LogRocket from 'logrocket'

type PWAPromoProps = {
  settings: boolean
}
export default function PWAPromo({ settings }: PWAPromoProps): JSX.Element {
  const auth = useAuth()
  const [prompt, setPWAPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)
  const [promo, showPromo] = useState(false)
  useEffect(() => {
    const pwa = (e: Event): void => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setPWAPrompt(e)
      LogRocket.track('PWA Native Shown')
      // Optionally, send analytics event that PWA install promo was shown.
      console.log(`'beforeinstallprompt' event was fired.`)
      console.log(e)
    }
    window.addEventListener('beforeinstallprompt', pwa)
    return () => window.removeEventListener('beforeinstallprompt', pwa)
  })
  useEffect(() => {
    if (auth.isPWA()) {
      showPromo(false)
      return
    } else if (localStorage.getItem('lastPWA')) {
      // PWA last session detected, if user open with-in 3 days
      // Change button to OPEN APP
      const time = localStorage.getItem('lastPWA')
      const dateToRemind = new Date(parseInt(time))
      dateToRemind.setDate(dateToRemind.getDate() + 3)
      if (new Date(time) <= dateToRemind) {
        setInstalled(true)
      }
    } else if (localStorage.getItem('pwaPrompt')) {
      const time = localStorage.getItem('pwaPrompt')
      const dateToRemind = new Date(parseInt(time))
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
    localStorage.setItem('pwaPrompt', new Date().valueOf().toString())
  }
  return (
    <Transition
      show={promo && (auth.user == null || (auth.metadata != null && !settings))}
      enter="transition duration-700 delay-150"
      enterFrom="opacity-0"
      enterTo="opactity-100"
      leave="transition duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="mb-8 text-sm sm:flex-row flex-col flex items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded shadow-md"
    >
      <button
        name="close"
        onClick={() => dismissPWA()}
        className="focus:outline-none block sm:hidden"
      >
        <XIcon className="w-5 h-5" />
      </button>
      <h2 className="text-lg">รู้มั้ย?</h2>
      <span className="font-light py-1 px-4 text-center sm:flex-row flex-col flex">
        <span>สามารถติดตั้งแอปพลิเคชั่น </span>
        <span>เพื่อให้เข้าใช้งานได้เร็วขึ้นด้วยนะ</span>
      </span>
      <button
        onClick={() => installOrOpenPWA()}
        className="text-black px-4 py-2 bg-gray-100 from-gray-100 to-gray-200 focus:bg-gradient-to-b hover:bg-gradient-to-b focus:outline-none rounded"
      >
        {installed ? 'เปิดในแอพ' : 'ติดตั้งเลย'}
      </button>
      <a
        href={'/install' + (installed ? '#open' : '')}
        id="pwamore"
        className="font-normal underline"
      >
        เรียนรู้เพิ่มเติม
      </a>
      <button
        name="close"
        onClick={() => dismissPWA()}
        className="focus:outline-none hidden sm:block"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </Transition>
  )
}
