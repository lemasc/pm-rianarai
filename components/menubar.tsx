import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../shared/authContext'
import MenuComponent from './menu'

type MenuBarProps = {
  landing?: boolean
}
const AnnouncementComponent = dynamic(() => import('../components/announce'))
export default function MenuBarComponent({ landing }: MenuBarProps): JSX.Element {
  const { metadata, ready } = useAuth()
  const [announce, setAnnounce] = useState(false)
  const [top, setTop] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const scrollHandler = (): void => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true)
    }
    window.addEventListener('scroll', scrollHandler)
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [top])

  function isActive(route: string): string {
    return (
      'cursor-pointer rounded-lg sm:px-8 px-4 py-2 text-sm ' +
      (route == router.pathname ? 'font-medium bg-gray-200 text-black' : 'hover:bg-gray-100')
    )
  }
  return (
    <>
      <AnnouncementComponent show={announce} onClose={() => setAnnounce(false)} />
      <div
        className={
          (landing ? (!top ? 'bg-white blur shadow-md' : 'bg-transparent') : 'bg-white shadow-md') +
          ' z-10 w-full fixed top-0 left-0 flex flex-row items-center justify-start px-6 py-4 sm:space-x-4 space-x-3 transition duration-300 ease-in-out'
        }
      >
        <div title="PM-RianArai" className="flex flex-row items-center">
          <Image src="/logo.png" width={50} height={50} />
          <h1
            className={'px-4 text-2xl header-font select-none ' + (!landing && ' hidden md:block')}
          >
            <span className={landing && top ? 'text-yellow-300' : 'text-red-500'}>เรียน</span>
            <span
              className={landing && top ? 'lg:text-purple-300 text-purple-500' : 'text-purple-500'}
            >
              อะไร
            </span>
          </h1>
        </div>
        {metadata && ready && (
          <>
            <Link href="/">
              <a title="หน้าหลัก" className={isActive('/')}>
                หน้าหลัก
              </a>
            </Link>
            <Link href="/work">
              <a title="งานที่ได้รับ" className={isActive('/work')}>
                งานที่ได้รับ
              </a>
            </Link>
            <Link href="/settings">
              <a title="การตั้งค่า" className={isActive('/settings')}>
                การตั้งค่า
              </a>
            </Link>
          </>
        )}
        <MenuComponent landing={landing && top} onAnnounce={() => setAnnounce(true)} />
      </div>
    </>
  )
}
