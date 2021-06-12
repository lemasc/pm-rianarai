import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { app as firebase } from '../shared/firebase'
const ModalComponent = dynamic(() => import('./modal'))

export default function NotifModal(): JSX.Element {
  const [notiPrompt, setNotiPrompt] = useState(false)
  const completeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setTimeout(() => setNotiPrompt(true), 5000)
  }, [])
  async function requestNotification(): Promise<boolean> {
    /* await Notification.requestPermission()
    const messaging = firebase.messaging()
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return false
    const token = await messaging.getToken({ vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY })
    if (!token) return false
    console.log(token)*/
    return true
  }
  return (
    <ModalComponent
      size="max-w-md"
      title="อนุญาตการเข้าถึงการแจ้งเตือน"
      show={notiPrompt}
      onClose={() => setNotiPrompt(false)}
      titleClass="text-gray-900 creative-font font-bold"
    >
      <div className="my-4">
        <p className="text-sm text-gray-500">
          อนุญาตการเข้าถึงเพื่อส่งการแจ้งเตือนเวลาเรียนล่วงหน้า และข้อมูลอื่น ๆ
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <button
          onClick={() => requestNotification()}
          className="btn px-4 py-2 text-white from-green-500 to-green-600 bg-green-500 ring-green-500"
        >
          อนุญาต
        </button>
        <button
          ref={completeButtonRef}
          className="btn px-4 py-2 text-gray-800 from-gray-200 to-gray-300 bg-gray-200 ring-gray-400"
          onClick={() => setNotiPrompt(false)}
        >
          ไว้ทีหลัง
        </button>
      </div>
    </ModalComponent>
  )
}
