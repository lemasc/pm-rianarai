import { useAuth } from '@/shared/authContext'
import AuthSpinner from '@/components/auth/spinner'
import MenuBarComponent from '@/components/layout/menubar'
import { ReactNodeArray, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useInsider } from '@/shared/insider'

const InsiderModal = dynamic(() => import('@/components/insider'))

export const CONTAINER = 'flex flex-1 flex-col sm:px-16 px-6 '
export const HEADER = 'pt-8 text-3xl'

type LayoutProps = {
  children: ReactNodeArray | JSX.Element
}

export default function LayoutComponent({ children }: LayoutProps): JSX.Element {
  const { ready, metadata } = useAuth()
  const { load } = useInsider()
  return (
    <>
      <AuthSpinner />
      <MenuBarComponent landing={ready ? metadata === undefined : false} />
      <main
        className={
          'mt-20 flex flex-1 w-full ' +
          (metadata
            ? 'justify-center flex-col '
            : 'relative md:flex-row flex-col md:justify-end items-center justify-center md:px-20')
        }
      >
        {ready && children}
      </main>

      {ready && load && <InsiderModal />}
    </>
  )
}
