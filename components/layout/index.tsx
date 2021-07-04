import { useAuth } from '@/shared/authContext'
import AuthSpinner from '@/components/auth/spinner'
import MenuBarComponent from '@/components/layout/menubar'

export const CONTAINER = 'flex flex-1 flex-col sm:px-16 px-6 '
export const HEADER = 'pt-8 text-3xl'

type LayoutProps = {
  children: JSX.Element
}

export default function LayoutComponent({ children }: LayoutProps): JSX.Element {
  const { ready, metadata } = useAuth()
  return (
    <>
      <AuthSpinner />
      <MenuBarComponent landing={ready ? metadata === undefined : false} />
      <main
        className={
          'mt-20 md:mb-0 mb-20 flex flex-1 w-full ' +
          (metadata
            ? 'justify-center flex-col '
            : 'relative md:flex-row flex-col md:justify-end items-center justify-center md:px-20')
        }
      >
        {ready && children}
      </main>
    </>
  )
}
