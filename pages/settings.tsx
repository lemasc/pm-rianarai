import Head from 'next/head'
import { useEffect } from 'react'
import { useState } from 'react'
import LayoutComponent, { CONTAINER, HEADER } from '../components/layout'
import MetadataComponent from '../components/meta'
import { Transition } from '@headlessui/react'

export default function SettingsPage(): JSX.Element {
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
        <div className={CONTAINER + "gap-10 sm:gap-8"}>
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
          <div className="grid">
            <div className="p-4 md:mx-8 border rounded bg-gray-50 dark:bg-gray-800">
              <h2 className="text-2xl font-medium p-8">ข้อมูลส่วนตัว</h2>
              <MetadataComponent onSubmit={() => setSuccess(true)} />
            </div>
          </div>
        </div>
      </LayoutComponent>
    </div>
  )
}
