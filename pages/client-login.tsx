import Head from 'next/head'
import HeaderComponent from '../components/header'
import SignInComponent from '../components/signin'
import { GetServerSideProps } from 'next'
import { useAuth } from '../shared/authContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import type { APIResult } from './api/client/get'
import { useRouter } from 'next/dist/client/router'
export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.query.session) {
    return {
      redirect: {
        destination: '/',
        permanent: true,
      },
    }
  }
  return {
    props: {},
  }
}
export default function ClientLoginPage(): JSX.Element {
  // The custom JWT token used for communication between web and desktop clients.
  const [token, setToken] = useState<string>('')
  const [relogin, setRelogin] = useState(false)
  const [error, setError] = useState<JSX.Element | null>(null)
  const { user, metadata } = useAuth()
  const router = useRouter()
  useEffect(() => {
    // This page is special, we need users to relogin
    if (!relogin || !user) return
    setError(null)
    async function dynamicLink(): Promise<void> {
      // When we get the user, we grab the ID token and return that back to the server
      try {
        const result = await axios.get('/api/client/get', {
          params: {
            token: await user.getIdToken(),
            session: router.query.session,
          },
        })
        console.log(result.data)
        const data = result.data as APIResult
        if (data.success) {
          setToken(data.message)
          setTimeout(() => {
            setError(<>หมดเวลาแล้ว หากต้องการล็อกอินใหม่กรุณาเปิดจากแอพพลิเคชั่นอีกครั้ง</>)
            setToken('')
          }, 120000)
        }
      } catch (err) {
        console.error(err)
        setError(<>ไม่สามารถเข้าสู่ระบบได้ กรุณาเข้าล็อกอินจากแอพพลิเคชั่นใหม่อีกครั้ง</>)
      }
    }
    if (metadata) {
      dynamicLink()
    } else {
      setRelogin(false)
      setError(
        <>
          บัญชีนี้เป็นบัญชีใหม่ กรุณาดำเนินการสมัครให้เสร็จสิ้นที่
          <a
            href="/"
            className="font-medium underline"
            target="_blank"
            rel="noopener noreferrer"
            title="Home Page"
          >
            หน้าหลัก
          </a>
          ก่อน
        </>
      )
    }
  }, [user, metadata, relogin, router.query.session])
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>Client Login : PM-RianArai</title>
        <meta property="og:url" content="https://pm-rianarai.vercel.app/about" />
        <meta property="og:title" content="เกี่ยวกับ PM-RianArai" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent className="" />
        <span className="text-center break-words sarabun-font max-w-2xl px-12 sm:px-4 py-2 mb-6 text-sm opacity-75">
          กรุณาเข้าสู่ระบบให้เสร็จสิ้นภายใน 2 นาที มิฉะนั้นระบบจะตัด
          ทำให้ต้องกดเข้าสู่ระบบใหม่จากแอพพลิเคชั่นอีกครั้ง
        </span>
        <div className="mb-8 mx-8 rounded-lg bg-white border shadow-md p-4 flex flex-col items-center justify-center">
          <h2 className="p-4 text-2xl font-medium text-gray-900">เข้าสู่ระบบ PM-RianArai Client</h2>
          {error && (
            <div className="px-4 py-3 text-sm rounded-lg bg-red-200 text-red-700">{error}</div>
          )}
          <div className="p-2 flex flex-col items-center justify-center">
            {relogin ? (
              <>
                {token == '' ? (
                  <h3 className="font-light py-2 text-lg">
                    {error === null ? 'กำลังดำเนินการ...' : 'การเข้าสู่ระบบล้มเหลว'}
                  </h3>
                ) : (
                  <>
                    <h3 className="text-green-600 text-lg">การเข้าสู่ระบบเสร็จสิ้น</h3>
                    <p className="py-4 text-sm font-light text-center sarabun-font">
                      กรุณาคลิกที่ปุ่มด้านล่างเพื่อคัดลอกรหัส Token จากนั้นกลับไปที่โปรแกรมแล้วเลือก{' '}
                      <b className="font-bold">เข้าสู่ระบบด้วย Token</b>
                      <br />
                      รหัสนี้มีอายุการใช้งาน 2 นาที
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(token)}
                      className="btn text-white px-4 py-2 bg-apple-500 from-apple-500 to-apple-600 ring-apple-500"
                    >
                      คัดลอกรหัส Token
                    </button>
                    <span className="text-sm py-4 sarabun-font">
                      เมื่อเรียบร้อยแล้วคุณสามารถปิดหน้านี้ได้ทันที
                    </span>
                  </>
                )}
              </>
            ) : (
              <SignInComponent onSuccess={() => setTimeout(() => setRelogin(true), 2000)} />
            )}
          </div>
        </div>
      </main>

      <footer className="text-sm bg-white dark:bg-gray-800 dark:text-white flex justify-center items-center w-full p-8 border-t">
        Producted by Lemasc
      </footer>
    </div>
  )
}