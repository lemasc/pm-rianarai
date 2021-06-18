import { useAuth } from '../shared/authContext'
import MenuBarComponent from '../components/menubar'
export const CONTAINER = 'flex flex-1 flex-col sm:px-16 px-6 sm:space-y-10 space-y-8'
export const HEADER = 'pt-8 text-3xl'

type LayoutProps = {
  children: JSX.Element
}

export default function LayoutComponent({ children }: LayoutProps): JSX.Element {
  const { ready, metadata } = useAuth()
  return (
    <>
      <MenuBarComponent landing={!(ready && metadata)} />
      <main
        className={
          'relative mt-20 flex flex-1 w-full ' +
          (ready &&
            (metadata
              ? 'justify-center '
              : 'md:flex-row flex-col md:justify-end items-center justify-center md:px-20'))
        }
      >
        {ready && children}
      </main>
    </>
  )
}
