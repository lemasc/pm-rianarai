import { useEffect, useState } from 'react'
import Head from 'next/head'
import SingletonRouter, { Router, useRouter } from 'next/router'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import axios, { CancelTokenSource } from 'axios'

import { APIResult } from '@/types/jwt'
import HeaderComponent from '@/components/layout/header'
import SignInComponent from '@/components/auth/signin'
import { useAuth } from '@/shared/authContext'

import { SSRContext, withSession } from '../shared/api'
import { db } from '@/shared/db'

export const getServerSideProps: GetServerSideProps = withSession(
  async (context: SSRContext): Promise<GetServerSidePropsResult<any>> => {
    if (!context.query.classroom || !context.req.session.get('token')) {
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
)

export default function ReLoginPage(): JSX.Element {
  const source: CancelTokenSource = axios.CancelToken.source()
  const [fetching, setFetch] = useState(false)
  const [relogin, setRelogin] = useState(false)
  const [error, setError] = useState<JSX.Element | null>(null)
  const { user, metadata, classroom } = useAuth()
  const router = useRouter()
  useEffect(() => {
    // This page is special, we need users to relogin
    if (!relogin || !user || !classroom) return
    setError(null)

    if (!metadata || classroom.filter((c) => c.id === router.query.classroom).length === 0) {
      setRelogin(false)
      setError(<>บัญชีไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง</>)
    }
  }, [user, metadata, relogin, router, classroom])
  function goBack(): void {
    router.replace('/settings')
  }
  async function deleteAccount(): Promise<void> {
    setFetch(true)
    try {
      const result = await axios.get('/api/classroom/deauthorize', {
        params: {
          classroom: router.query.classroom,
        },
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      })
      const data = result.data as APIResult
      if (data.success) {
        const index = classroom.findIndex((c) => c.id === router.query.classroom)
        const courses = await db.courses.where('accountId').equals(index).toArray()
        await Promise.all(
          courses.map(async (c) => {
            await db.courseWork.where('courseId').equals(c.id).delete()
          })
        )
        await db.courses.where('accountId').equals(index).delete()
        goBack()
      }
    } catch (err) {
      console.error(err)
      setError(<>ไม่สามารถยกเลิกการเชื่อมต่อบัญชีได้ กรุณาลองใหม่อีกครั้ง</>)
    } finally {
      setFetch(false)
    }
  }
  // Cancel on navigation
  useEffect(() => {
    function beforeunload(): void {
      source.cancel()
      setFetch(false)
    }
    // @ts-expect-error This is a hack for override navigation
    SingletonRouter.router.change = (...args) => {
      source.cancel()
      setFetch(false)
      // @ts-expect-error Readonly Router
      Router.prototype.change.apply(SingletonRouter.router, args)
    }

    window.addEventListener('beforeunload', beforeunload)
    return () => {
      // @ts-expect-error Readonly Router
      delete SingletonRouter.router.change
      window.removeEventListener('beforeunload', beforeunload)
    }
  }, [source])

  const _class = classroom && classroom.filter((c) => c.id === router.query.classroom)
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>Login : PM-RianArai</title>
        <meta property="og:url" content="https://pm-rianarai.vercel.app/about" />
        <meta property="og:title" content="เกี่ยวกับ PM-RianArai" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent className="" />
        <span className="font-bold text-center break-words sarabun-font max-w-2xl px-12 sm:px-4 py-2 mb-6 text-sm opacity-75">
          เนื่องจากคุณกำลังดำเนินการข้อมูลที่สำคัญ เราจึงขอให้คุณเข้าสู่ระบบใหม่อีกครั้ง
        </span>
        <div className="mb-8 mx-8 rounded-lg bg-white border shadow-md p-4 flex flex-col items-center justify-center text-center">
          <h2 className="p-4 text-2xl font-medium text-gray-900">
            {relogin ? 'ยกเลิกการเชื่อมต่อบัญชี' : 'เข้าสู่ระบบ PM-RianArai'}
          </h2>
          {error && (
            <div className="px-4 py-3 text-sm rounded-lg bg-red-200 text-red-700">{error}</div>
          )}
          <div className="p-2 flex flex-col items-center justify-center">
            {relogin && _class && _class.length > 0 ? (
              <>
                <h3 className="text-red-500">
                  คุณกำลังดำเนินการยกเลิกการเชื่อมต่อบัญชี Google Classroom ดังต่อไปนี้
                </h3>
                <div className="flex flex-col gap-4 p-4 items-center justify-center">
                  <div className="flex flex-col items-center justify-center p-4 gap-2 border rounded">
                    <h4 className="sarabun-font text-lg font-bold">{_class[0].name}</h4>
                    <span className="font-light text-sm">{_class[0].email}</span>
                  </div>
                  <span className="flex flex-col gap-1 text-center">
                    <span className="font-light">
                      ข้อมูลทั้งหมดใน PM-RianArai จะถูกลบทันทีและไม่สามารถกู้คืนได้
                    </span>
                    <span className="text-red-500">ต้องการยกเลิกการเชื่อมต่อหรือไม่</span>
                  </span>
                </div>
                <div className="items-center justify-center flex flex-col sm:grid-cols-2 sm:grid gap-4 w-full">
                  <button
                    disabled={fetching}
                    onClick={() => deleteAccount()}
                    type="submit"
                    className="w-full text-white btn py-2 ring-red-500 bg-red-500 from-red-500 to-red-600"
                  >
                    ตกลง
                  </button>
                  <button
                    disabled={fetching}
                    onClick={() => goBack()}
                    type="button"
                    className="w-full btn py-2 ring-gray-300 text-black bg-gray-300 from-gray-300 to-gray-400"
                  >
                    ยกเลิก
                  </button>
                </div>
              </>
            ) : (
              <SignInComponent
                onSuccess={() => setTimeout(() => setRelogin(true), 2000)}
                disableSignUp={true}
                reAuthenticate={true}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
