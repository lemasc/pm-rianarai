import { Disclosure, Transition } from '@headlessui/react'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Announcement, useAuth, UserMetadata } from '../shared/authContext'
import { LogoutIcon, MenuIcon, SpeakerphoneIcon, XIcon } from '@heroicons/react/outline'
import { Document } from 'swr-firestore-v9'
import { useWindowWidth } from '@react-hook/window-size/throttled'

const AnnouncementComponent = dynamic(() => import('../components/announce'))

type MenuBarProps = {
  landing?: boolean
}

type Navigation = {
  href: string
  title: string
}

const navigation: Navigation[] = [
  {
    href: '/',
    title: 'หน้าหลัก',
  },
  {
    href: '/work',
    title: 'งานที่ได้รับ',
  },
  {
    href: '/settings',
    title: 'การตั้งค่า',
  },
]

function Toolbar({ setAnnounce }: { setAnnounce: (boolean) => void }): JSX.Element {
  const { announce, metadata, signOut, remove } = useAuth()
  return (
    <>
      <button
        title="ประกาศ"
        className="relative focus:outline-none"
        onClick={() => setAnnounce(true)}
      >
        <SpeakerphoneIcon
          className="w-8 h-8 font-light opacity-60 hover:opacity-100"
          strokeWidth={1}
        />
        {announce && metadata && getUnreadAnnounce(announce, metadata).length > 0 && (
          <span className="absolute rounded-full bg-red-500 bg-opacity-75 hover:bg-opacity-100 px-2 text-sm text-white -top-1 -right-2">
            {getUnreadAnnounce(announce, metadata).length}
          </span>
        )}
      </button>
      {metadata && (
        <>
          <button
            title="ออกจากระบบ"
            className="focus:outline-none"
            onClick={() => {
              if (metadata) return signOut()
              remove().then((ok) => {
                if (!ok) signOut()
              })
            }}
          >
            <LogoutIcon
              className="w-8 h-8 font-light opacity-60 hover:opacity-100"
              strokeWidth={1}
            />
          </button>
        </>
      )}
    </>
  )
}

function Pages(): JSX.Element {
  const { ready, metadata } = useAuth()
  const router = useRouter()
  if (!(metadata && ready)) return null
  function isActive(route: string): string {
    return (
      'cursor-pointer rounded-lg sm:px-8 px-4 py-2 text-sm ' +
      (route == router.pathname ? 'font-medium bg-gray-200 text-black' : 'hover:bg-gray-100')
    )
  }
  return (
    <>
      {navigation.map((n) => (
        <Link key={n.title} href={n.href}>
          <a
            title={n.title}
            className={isActive(n.href)}
            aria-current={n.href == router.pathname ? 'page' : undefined}
          >
            {n.title}
          </a>
        </Link>
      ))}
    </>
  )
}

export function getUnreadAnnounce(
  announce: Document<Announcement>[],
  metadata: UserMetadata
): Document<Announcement>[] {
  if (!announce) return []
  return Object.values(announce.filter((a) => !(metadata && metadata.announceId?.includes(a.id))))
}

export default function MenuBarComponent({ landing }: MenuBarProps): JSX.Element {
  const [showAnnounce, setAnnounce] = useState(false)
  const { metadata } = useAuth()
  const [top, setTop] = useState(true)
  const width = useWindowWidth({ fps: 60 })

  useEffect(() => {
    const scrollHandler = (): void => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true)
    }
    window.addEventListener('scroll', scrollHandler)
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [top])

  return (
    <>
      <AnnouncementComponent show={showAnnounce} onClose={() => setAnnounce(false)} />
      <Disclosure as="nav" className="z-10">
        {({ open }) => (
          <>
            <div
              className={
                (landing
                  ? !top
                    ? 'bg-white blur shadow-md'
                    : 'bg-transparent'
                  : 'bg-white shadow-md') +
                ' w-full fixed top-0 left-0 flex flex-row items-center justify-start px-6 py-4 sm:space-x-4 space-x-3 transition duration-300 ease-in-out'
              }
            >
              <div title="PM-RianArai" className="flex flex-row items-center">
                <Image src="/logo.png" width={50} height={50} />
                <h1
                  className={
                    'px-4 text-2xl header-font select-none' +
                    (!landing && ' block sm:hidden md:block')
                  }
                >
                  <span className={landing && top ? 'text-yellow-300' : 'text-red-500'}>เรียน</span>
                  <span
                    className={
                      landing && top ? 'lg:text-purple-300 text-purple-500' : 'text-purple-500'
                    }
                  >
                    อะไร
                  </span>
                </h1>
              </div>
              {width >= 640 && <Pages />}
              {!landing && metadata && width < 640 ? (
                <div className={'flex-row absolute top-0 right-0 p-6 space-x-4 sm:hidden flex'}>
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="text-gray-600 hover:text-black focus:outline-none">
                    <span className="sr-only hidden">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-8 w-8" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-8 w-8" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              ) : (
                <div
                  className={
                    'flex-row absolute top-0 right-0 p-6 space-x-4 ' +
                    (landing ? 'flex text-white' : 'sm:flex hidden text-gray-800')
                  }
                >
                  <Toolbar setAnnounce={() => setAnnounce(true)} />
                </div>
              )}
            </div>
            <Transition
              show={open && width <= 640}
              enter="transition duration-250 ease-in"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-250 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
              className="absolute inset-0 mt-20 w-full"
            >
              <Disclosure.Panel static>
                <div className="p-4 flex flex-col space-y-2 bg-gray-50 rounded-b-lg w-full shadow-lg">
                  <Pages />
                  <div className="flex justify-center flex-row space-x-16 pb-4">
                    <Toolbar setAnnounce={setAnnounce} />
                  </div>
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </>
  )
}
