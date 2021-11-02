import React from 'react'
import Head from 'next/head'
import Title from '@/components/layout/brand'

export default function SplashScreen(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 py-3 rounded-4xl select-none">
      <Head>
        <title>RianArai</title>
      </Head>
      <img src="/logo.svg" width={100} height={100} alt="Logo" draggable={false} />
      <Title className="px-4 text-3xl" />
      <span className="py-5 border-t text-sm sarabun-font text-gray-500">
        Copyright &copy; 2021{new Date().getFullYear() !== 2021 && `-${new Date().getFullYear()}`}{' '}
        Lemasc Service Co.,Ltd
      </span>
    </div>
  )
}
