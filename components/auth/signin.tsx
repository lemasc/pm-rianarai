import { Transition } from '@headlessui/react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/shared/authContext'
import zxcvbn from 'zxcvbn'
import PasswordStrengthMeter from './password'
import { Provider } from '@/types/auth'

type SignInProps = {
  disableSignUp?: boolean
  reAuthenticate?: boolean
  onSuccess?: () => void
}
type MetaProps = SignInProps & {
  cancel: () => void
}

type EmailForm = {
  email: string
  password: string
}

type EmailPage = 'email' | 'signin' | 'signup'
function EmailForm({ cancel, onSuccess, reAuthenticate, disableSignUp }: MetaProps): JSX.Element {
  const [_error, setError] = useState<null | string>(null)
  const [page, setPage] = useState<EmailPage>('email')
  const { signUp, signIn, getMethods } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    unregister,
    formState: { errors },
  } = useForm<EmailForm>({
    reValidateMode: 'onSubmit',
  })
  const password = watch('password')
  const title = {
    email: 'ป้อนอีเมล',
    signin: 'ยินดีต้อนรับ',
    signup: 'ลงทะเบียน',
  }
  const submit = {
    email: 'ต่อไป',
    signin: 'เข้าสู่ระบบ',
    signup: 'ลงทะเบียน',
  }
  async function checkSignIn(email: string): Promise<void> {
    const methods = await getMethods(email)
    if (methods.length === 0) {
      if (disableSignUp) return setError('กรุณาเข้าสู่ระบบด้วยบัญชีที่มีอยู่แล้ว')
      return setPage('signup')
    }
    if (methods[0] === 'password') return setPage('signin')
    const shortName = methods[0].slice(0, methods[0].indexOf('.'))
    setError(
      'กรุณาเข้าสู่ระบบด้วยบัญชีที่ลงทะเบียนไว้กับ ' +
        shortName.charAt(0).toUpperCase() +
        shortName.slice(1)
    )
  }
  async function _signUp(email: string, password: string): Promise<void> {
    if (zxcvbn(password).score < 2) return setError('กรุณากรอกรหัสผ่านที่แข็งแรงพอ')
    const result = await signUp(email, password)
    if (!result.success && result.message) {
      switch (result.message) {
        case 'auth/email-already-in-use':
          setError('อีเมลนี้ถูกใช้ไปแล้ว')
          break
        case 'auth/network-request-failed':
          setError('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
          break
        case 'auth/weak-password':
          setError('กรุณากรอกรหัสผ่านที่แข็งแรงพอ')
          break
        default:
          setError('ไม่สามารถสร้างบัญชีได้ เนื่องจาก ' + result.message.replace('auth/', ''))
      }
    } else {
      onSuccess && onSuccess()
    }
  }
  async function _signIn(email: string, password: string): Promise<void> {
    const result = await signIn(email, password, reAuthenticate)
    if (!result.success && result.message) {
      console.log(result.message)
      switch (result.message) {
        case 'auth/user-mismatch':
          setError('บัญชีไม่ตรงกัน กรุณาเข้าสู่ระบบใหม่อีกครั้ง')
          break
        case 'auth/user-not-found':
          setError('ไม่พบผู้ใช้นี้')
          break
        case 'auth/network-request-failed':
          setError('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
          break
        case 'auth/wrong-password':
          setError('รหัสผ่านไม่ถูกต้อง')
          break
        default:
          setError('ไม่สามารถเข้าสู่ระบบได้ เนื่องจาก ' + result.message.replace('auth/', ''))
      }
    } else {
      onSuccess && onSuccess()
    }
  }
  const formSubmit = async (data: EmailForm): Promise<void> => {
    setError(null)
    switch (page) {
      case 'email':
        return await checkSignIn(data.email)
      case 'signup':
        return await _signUp(data.email, data.password)
      case 'signin':
        return await _signIn(data.email, data.password)
    }
  }
  function goBack(): void {
    setError(null)
    if (page !== 'email') {
      unregister('password')
      setPage('email')
    } else {
      reset()
      cancel()
    }
  }
  return (
    <>
      <form className="flex flex-col gap-2 gap-x-4 w-72" onSubmit={handleSubmit(formSubmit)}>
        {(_error !== null || Object.values(errors).length !== 0) && (
          <div className="px-4 py-3 border rounded-lg bg-red-200 text-red-700 text-center">
            {_error !== null && _error}
            {Object.values(errors).length !== 0 && Object.values(errors)[0].message}
          </div>
        )}
        <h3 className="text-left text-xl pb-2 font-medium">{title[page]}</h3>
        <input
          name="email"
          className={'input rounded-md' + (page !== 'email' ? ' bg-gray-100' : '')}
          type="email"
          readOnly={page !== 'email'}
          placeholder="ป้อนอีเมลของคุณ..."
          {...register('email', { required: { value: true, message: 'กรุณากรอกอีเมล' } })}
        />
        {page !== 'email' && (
          <>
            <input
              name="password"
              className="input rounded-md"
              type="password"
              autoComplete="current-password"
              placeholder="ป้อนรหัสผ่าน..."
              {...register('password', {
                required: { value: true, message: 'กรุณากรอกรหัสผ่าน' },
              })}
            />
            {page === 'signup' && (
              <PasswordStrengthMeter password={typeof password === 'string' ? password : ''} />
            )}
          </>
        )}
        <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-4 gap-2">
          <button
            type="submit"
            className="sm:mt-4 mt-2 text-white btn py-2 ring-apple-500 bg-apple-500 from-apple-500 to-apple-600"
          >
            {submit[page]}
          </button>
          <button
            type="reset"
            onClick={() => goBack()}
            className="sm:mt-4 btn py-2 ring-gray-300 text-black bg-gray-300 from-gray-300 to-gray-400"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </>
  )
}

export default function SignInComponent({
  onSuccess,
  reAuthenticate,
  disableSignUp,
}: SignInProps): JSX.Element {
  const auth = useAuth()
  const [show, setShow] = useState(true)
  const [email, setEmail] = useState(false)
  const [next, setNext] = useState<null | boolean>(false)
  const [error, setError] = useState<null | string>(null)
  async function provider(p: Provider): Promise<void> {
    const result = await auth.signInWithProvider(p, reAuthenticate)
    if (email) return
    if (!result.success) {
      console.error(result.message)
      switch (result.message) {
        case 'auth/popup-closed-by-user':
          break
        case 'auth/popup-blocked':
          setError('กรุณาอนุญาตการเปิด Popup เพื่อเข้าสู่ระบบ')
          break
        case 'auth/user-mismatch':
          setError('บัญชีไม่ตรงกัน กรุณาเข้าสู่ระบบใหม่อีกครั้ง')
          break
        default:
          setError('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง')
      }
    } else {
      onSuccess && onSuccess()
    }
  }
  return (
    <Transition
      show={show}
      appear={true}
      className="py-2 px-4 login flex flex-col space-y-4"
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      beforeEnter={() => {
        setError(null)
        if (next !== email) {
          setEmail(next)
          setNext(null)
        }
      }}
      afterLeave={() => setShow(true)}
    >
      {error && (
        <div className="px-4 py-3 border rounded-lg bg-red-200 text-red-700 text-center">
          {error}
        </div>
      )}
      {email ? (
        <EmailForm
          disableSignUp={disableSignUp}
          reAuthenticate={reAuthenticate}
          onSuccess={onSuccess}
          cancel={() => {
            setNext(false)
            setShow(false)
          }}
        />
      ) : (
        <>
          <button
            onClick={() => provider('google.com')}
            className="hover:bg-gradient-to-b focus:bg-gradient-to-b focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-gray-200 text-gray-500 ring-gray-300 bg-white from-white to-gray-100"
          >
            <img
              alt="Google"
              width={20}
              height={20}
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            />
            <span>Sign in with Google</span>
          </button>
          <button
            onClick={() => provider('facebook.com')}
            className="btn text-white  ring-blue-500 bg-blue-500 from-blue-500 to-blue-600"
          >
            <img
              alt="Facebook"
              width={20}
              height={20}
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg"
            />
            <span>Sign in with Facebook</span>
          </button>
          <button
            onClick={() => {
              setNext(true)
              setShow(false)
            }}
            className="btn text-white  ring-red-500 bg-red-500 from-red-500 to-red-600"
          >
            <img
              alt="Email"
              width={20}
              height={20}
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg"
            />
            <span>Sign in with email</span>
          </button>
        </>
      )}
    </Transition>
  )
}
