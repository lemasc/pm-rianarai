import React, { useEffect } from 'react'
import Head from 'next/head'

import { useAuth } from '@/shared/authContext'
import HeaderComponent from '@/components/layout/header'

export default function SubmitUpdate(): JSX.Element {
  const { user } = useAuth()
  useEffect(() => {
    let red = null
    const params = []
    if (user) {
      params.push('entry.1957464088=' + user.uid)
    }
    const url =
      'https://docs.google.com/forms/d/e/1FAIpQLSe1i-5G90ph8hKy02jN3s7XSVWBhPJ_6NWVuZcVxmZdFSjdcA/viewform?usp=pp_url&'
    if (red) clearTimeout(red)
    red = setTimeout(() => window.location.replace(url + params.join('&')), 3000)
  }, [user])
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>Redirect : PM-RianArai</title>
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent />
        <div className="p-4">กำลังดำเนินการเปลี่ยนเส้นทาง...</div>
      </main>
    </div>
  )
}
