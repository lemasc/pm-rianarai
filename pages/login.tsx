import React, { useState } from 'react'
import Head from 'next/head'
import { clipboard, shell } from 'electron'
import axios from 'axios'
import { nanoid } from 'nanoid'
import { signInWithCustomToken } from '@firebase/auth'
import { auth } from '../shared/firebase'

type APIData = {
  success: boolean
  message: string
}

function Login(): JSX.Element {
  const [sessionId, setSessionId] = useState<string>('')
  const [error, setError] = useState<JSX.Element | null>(null)
  async function verifyToken(): Promise<void> {
    setError(null)
    const token = clipboard.readText()
    if (token.trim().length == 0)
      return setError(
        <>
          หลังจากเข้าสู่ระบบแล้วกรุณากด<b>คัดลอก Token</b> แล้วจึงคลิกทีนี่
        </>
      )
    if (!token.includes('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'))
      return setError(<>ดูเหมือนว่าจะไม่ได้คัดลอกมานะ ลองใหม่มั้ย?</>)
    try {
      const result = await axios('/api/client', {
        method: 'POST',
        params: new URLSearchParams({
          session: sessionId,
        }),
        headers: {
          Authorization: 'Bearer ' + token,
        },
        validateStatus: function (status) {
          return status < 500
        },
      })
      const data: APIData = result.data
      if (!data.success) {
        switch (data.message) {
          case 'invalid-token':
            return setError(<>Token ไม่ถูกต้อง กรุณาตรวจสอบใหม่อีกครั้ง</>)
          case 'token-expired':
            return setError(<>Token หมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง</>)
          default:
            return setError(<>ไม่สามารถยืนยัน Token ได้ กรุณาลองใหม่อีกครั้ง</>)
        }
      }
      await signInWithCustomToken(auth, data.message)
    } catch (err) {
      console.error(err)
      setError(<>ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง</>)
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Head>
        <title>Login - PM-RianArai</title>
      </Head>
      {error && (
        <div className="text-red-600 bg-red-200 rounded-lg font-bold px-8 py-3 text-center">
          {error}
        </div>
      )}
      <div className="flex divide-x divide-gray-300 py-4">
        <div className="flex flex-col items-center justify-center w-64">
          <img className="m-4" src="/logo.png" width={100} height={100} alt="Logo" />
          <span className="px-4 py-2 text-bold">PM-RianArai</span>
        </div>
        <div className="flex flex-col items-center justify-center px-4 py-2 flex-grow">
          <h1 className="text-xl font-bold p-4">เข้าสู่ระบบ</h1>
          <button
            onClick={() => {
              setError(null)
              const id = nanoid()
              setSessionId(id)
              shell.openExternal(process.env.NEXT_PUBLIC_ENDPOINT + '/client-login?session=' + id)
            }}
            className="w-48 px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 focus:outline-none focus:ring-blue-500 focus:ring-2 focus:ring-offset-4 text-medium"
          >
            Login using Browser
          </button>
          <div className="py-8 px-2 text-sm">
            ได้รับ Token แล้วใช่ไหม{' '}
            <button
              onClick={() => verifyToken()}
              className="focus:outline-none text-blue-500 underline font-bold"
            >
              เข้าสู่ระบบด้วย Token
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
