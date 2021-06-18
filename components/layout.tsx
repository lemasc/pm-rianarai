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
      <MenuBarComponent landing={false} />
      <main
        className={
          'mt-20 flex flex-1 flex-col w-full' +
          (ready && metadata ? '' : ' items-center justify-center')
        }
      >
        {ready && children}
      </main>
    </>
  )
}
