import { useAuth } from '@/shared/authContext'
import { useState } from 'react'
import ModalComponent from '../modal'
import Loader from 'react-loader-spinner'
import { emitEvent } from '@/shared/native'

export default function GoogleSignInComponent() {
  const [error, setError] = useState(false)
  const [signingIn, isSigningIn] = useState(false)
  const { signInWithGoogle } = useAuth()
  const signIn = () =>
    signInWithGoogle().then((v) => {
      isSigningIn(false)
      setError(!v.success)
    })
  return (
    <div className="flex flex-col gap-4 font-light items-center justify-center text-center">
      <button
        onClick={() => {
          setError(false)
          isSigningIn(true)
          setTimeout(() => signIn(), 1000)
        }}
        className="text-gray-600 login-btn w-full border shadow px-4 py-3 rounded hover:bg-gray-100 bg-gray-50"
      >
        <img
          alt="Google"
          width={20}
          height={20}
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        />
        <span className="ml-4 -pt-1">Sign in with Google</span>
      </button>
      <span className="text-gray-500 dark:text-gray-200">
        ใช้บัญชีหลักที่เชื่อมต่อกับ Google Classroom
      </span>

      <span className="text-center text-sm text-gray-400">
        ระบบอาจแสดงหน้าจอคำยินยอมในการเข้าถึงข้อมูล (Consent) <br />
        <a
          className="underline text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-600"
          href="https://rianarai.netlify.app/scopes"
          target="_blank"
          rel="noreferrer noopener"
        >
          เรียนรู้เพิ่มเติมเกี่ยวกับสิทธิต่าง ๆ ที่ใช้
        </a>
      </span>
      {error && (
        <span className="font-normal text-red-600 mt-4">
          การเข้าสู่ระบบล้มเหลว กรุณาเข้าสู่ระบบใหม่อีกครั้ง
        </span>
      )}
      <ModalComponent
        title="กำลังเข้าสู่ระบบ"
        show={signingIn}
        size="max-w-md"
        closable={false}
        onClose={() => isSigningIn(false)}
      >
        <div className="p-4 text-center flex flex-col items-center gap-4 font-light">
          <span>ระบบจะเปิดเบราวเซอร์เริ่มต้นเพื่อเข้าสู่ระบบ กรุณารอสักครู่...</span>

          <Loader type="TailSpin" color="#3B82F6" height={50} width={50} />
          <button
            onClick={() => signIn()}
            className="rounded-lg text-gray-800 border-blue-500 border-2 hover:bg-gray-200 px-4 py-2"
          >
            ส่งคำขอเข้าสู่ระบบอีกครั้ง
          </button>
          <button
            onClick={() => {
              emitEvent('cancel-sign-in')
              isSigningIn(false)
            }}
            className="underline text-red-600 text-sm"
          >
            ยกเลิกการเข้าสู่ระบบ
          </button>
        </div>
      </ModalComponent>
    </div>
  )
}
