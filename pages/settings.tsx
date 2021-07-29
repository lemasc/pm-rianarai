import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'

import LayoutComponent, { CONTAINER, HEADER } from '@/components/layout'
import MetadataComponent from '@/components/auth/meta'
import { useAuth } from '@/shared/authContext'
import { XIcon } from '@heroicons/react/outline'
import Link from 'next/link'

export default function SettingsPage(): JSX.Element {
  const { classroom } = useAuth()
  const [success, setSuccess] = useState<boolean>(false)
  useEffect(() => {
    if (success) setTimeout(() => setSuccess(false), 3000)
  }, [success])
  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>การตั้งค่า - PM-RianArai</title>
      </Head>
      <LayoutComponent>
        <div className={CONTAINER + 'gap-10 sm:gap-8 mb-20 md:mb-0'}>
          <h1 className={HEADER}>การตั้งค่า</h1>
          <Transition
            show={success}
            enter="ease-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-500"
            leaveFrom="opactity-100"
            leaveTo="opacity-0"
          >
            <div className="px-4 py-3 rounded-lg bg-green-200 text-green-700">
              บันทึกการตั้งค่าเสร็จสิ้น
            </div>
          </Transition>
          <div className="md:grid-cols-2 grid gap-4">
            <div className="pb-4 border rounded bg-gray-50 dark:bg-gray-800">
              <h2 className="text-2xl font-medium px-8 pt-8 pb-4 md:pb-8">ข้อมูลส่วนตัว</h2>
              <MetadataComponent onSubmit={() => setSuccess(true)} />
            </div>
            <div className="border rounded bg-gray-50 dark:bg-gray-800 p-8 flex flex-col gap-4">
              <h2 className="text-2xl font-medium">Google Classroom</h2>
              {classroom ? (
                <>
                  <span className="font-light">
                    เชื่อมต่อแล้ว {classroom ? classroom.length : 0} บัญชี
                  </span>
                  {classroom.map((c) => (
                    <div
                      key={c.email}
                      className="items-center flex flex-row border bg-white hover:bg-gray-100 cursor-pointer rounded p-4 gap-4"
                    >
                      <div className="flex sm:flex-row flex-col flex-grow gap-2 sm:items-center">
                        <div className="flex flex-col flex-grow">
                          <b className="text-lg sarabun-font">{c.name}</b>
                          <span className="text-sm font-light">{c.email}</span>
                        </div>
                        <span className={c.valid ? 'text-green-500' : 'text-red-500'}>
                          เชื่อมต่อ{c.valid ? 'แล้ว' : 'ไม่สำเร็จ'}
                        </span>
                      </div>

                      <Link href={`/relogin?classroom=${c.id}`}>
                        <a title="ลบบัญชี้นี้" className="outline-none hover:text-red-600">
                          <XIcon className="h-5 w-5" />
                        </a>
                      </Link>
                    </div>
                  ))}
                  {classroom.filter((c) => !c.valid).length > 0 && (
                    <span className="font-medium text-red-500">
                      คลิกปุ่มด้านล่างแล้วเข้าสู่ระบบด้วยบัญชีเดิมเพื่อเชื่อมต่อใหม่อีกครั้ง
                    </span>
                  )}
                  <Link href="/api/classroom/authorize">
                    <a
                      title="เชื่อมต่อบัญชีใหม่หรือแก้ไขปัญหาการเชื่อมต่อเดิม"
                      className="text-center w-full btn bg-green-500 from-green-500 to-green-600 text-white px-4 py-2 ring-green-500"
                    >
                      เชื่อมต่อบัญชี Google Classroom
                    </a>
                  </Link>
                </>
              ) : (
                <span className="font-light">กำลังโหลดข้อมูลบัญชี...</span>
              )}
            </div>
          </div>
        </div>
      </LayoutComponent>
    </div>
  )
}
