import { useEffect, useState } from 'react'
import ModalComponent from './modal'
import MarkDownComponent from './markdown'
import useSWR from 'swr/immutable'
import Image from 'next/image'
import axios from 'axios'

export default function InsiderModal() {
  const [canClose, setCanClose] = useState(false)
  const { data } = useSWR(['/announce', 'v3_insider'], (key, name) =>
    axios.get(`/api${key}?name=${name}`).then((c) => c.data)
  )
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!data) return
    setTimeout(() => setShow(true), 250)
  }, [data])
  const onClose = () => {
    localStorage.setItem('insider_notice', 'true')
    setShow(false)
  }
  return (
    <ModalComponent
      closable={canClose}
      size="max-w-5xl"
      title="RianArai 3.0 เวอร์ชั่นเบต้าพร้อมใช้งานแล้ว"
      show={show}
      onClose={onClose}
      titleClass="bg-black text-white bg-opacity-80 creative-font font-bold"
    >
      <>
        <div className="bg-black text-white flex flex-col gap-3 items-center justify-center p-6">
          <div className="flex flex-row gap-4 items-center">
            <Image src="/logo_white.svg" width={50} height={50} />
            <span className="header-font text-3xl">เรียนอะไร</span>
          </div>
          <span className="text-lg">Insider Release</span>
        </div>
        <div className="md:px-10 p-6 bg-gray-100 sarabun-font">
          {data && (
            <MarkDownComponent className="leading-7 space-y-4" content={data.content} search="" />
          )}
          <div className="flex flex-col gap-4 my-4">
            <a
              href="https://rianarai.netlify.app/insider"
              target="_blank"
              rel="noreferrer noopener"
              className="text-center w-full btn px-4 py-2 bg-black text-white ring-black from-gray-800 to-gray-800"
            >
              ไปยังหน้า RianArai Insider
            </a>
            <button
              className="w-full btn px-4 py-2 border-2 border-gray-800 from-gray-200 to-gray-200 ring-black"
              onClick={() => {
                setCanClose(true)
                onClose()
              }}
            >
              รับทราบและปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      </>
    </ModalComponent>
  )
}
