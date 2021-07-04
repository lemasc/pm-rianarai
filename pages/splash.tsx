import React from 'react'
import Head from 'next/head'

export default function SplashScreen(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 rounded-4xl bg-gradient-to-b from-yellow-200 to-yellow-300">
      <Head>
        <title>PM-RianArai</title>
      </Head>
      <img src="/logo.png" width={150} height={150} alt="Logo" />
      <span className="text-xl font-medium">กำลังโหลด...</span>
    </div>
  )
}
