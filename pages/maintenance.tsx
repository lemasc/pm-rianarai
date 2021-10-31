import Head from 'next/head'
import HeaderComponent from '@/components/layout/header'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import duration, { DurationUnitType } from 'dayjs/plugin/duration'
import { SpeakerphoneIcon } from '@heroicons/react/outline'
import FooterComponent from '@/components/layout/footer'
import AnnouncementComponent from '@/components/announce'
dayjs.extend(duration)

function TimeItem({ children, text }: { children: string; text: string }): JSX.Element {
  return (
    <div className="flex flex-col gap-1 w-16">
      <span className="text-3xl">{children}</span>
      <span className="sarabun-font text-sm">{text}</span>
    </div>
  )
}

function CountDown(): JSX.Element {
  const [date, setDate] = useState(dayjs())
  const text = ['วัน', 'ชั่วโมง', 'นาที', 'วินาที']
  useEffect(() => {
    setInterval(() => setDate(dayjs()), 1000)
  }, [])
  function getDate(unit: DurationUnitType): string {
    const d = dayjs.duration(dayjs('2021-11-02').diff(date))
    return (Math.floor(unit.includes('d') ? d.as(unit) : d.get(unit)) / 100).toFixed(2).slice(2)
  }

  return (
    <div className="flex flex-row flex-wrap gap-2 font-medium w-44 sm:w-auto">
      {['d', 'h', 'm', 's'].map((d, i) => (
        <>
          <TimeItem text={text[i]}>{getDate(d as DurationUnitType)}</TimeItem>
          {i !== 3 && <span className="text-3xl">:</span>}
        </>
      ))}
    </div>
  )
}
export default function MaintenancePage(): JSX.Element {
  const [announce, setAnnounce] = useState(false)
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>PM-RianArai</title>
      </Head>
      <AnnouncementComponent show={announce} onClose={() => setAnnounce(false)} />

      <div className={'flex-row absolute top-0 right-0 p-6 space-x-4 flex text-gray-800'}>
        <button
          title="ประกาศ"
          className="relative focus:outline-none"
          onClick={() => setAnnounce(true)}
        >
          <SpeakerphoneIcon
            className="w-8 h-8 font-light opacity-60 hover:opacity-100"
            strokeWidth={1}
          />
        </button>
      </div>
      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent />
        <div className="p-4 text-center flex-col flex items-center justify-center gap-2 text-sm sm:text-base">
          <h2 className="text-2xl font-bold creative-font">
            ปิดเว็บไซต์ชั่วคราวเนื่องจากปิดภาคเรียนที่ 1
          </h2>
          <p className="p-4 sarabun-font max-w-3xl leading-6">
            แต่อย่าเพิ่งลบทิ้งนะ!{' '}
            <b className="text-red-500">หากในภาคเรียนที่ 2 ยังคงเรียนออนไลน์ด้วยระบบ Zoom</b>{' '}
            เว็บไซต์จะกลับมาออนไลน์ในวันที่ 2 พฤศจิกายน 2564
            พร้อมกับเว็บไซต์และแอพพลิเคชั่นโฉมใหม่ทั้งหมด 😍
          </p>
          <span className="text-medium text-red-500 pb-4 px-2">
            อย่างไรก็ตาม PM-RianArai จะติดตามข่าวสารจากทางโรงเรียนอย่างใกล้ชิด
            และหากมีการเปลี่ยนแปลงจะแจ้งให้ทราบทันที
          </span>
          <div className="rounded-lg shadow-lg flex flex-col gap-4 items-center justify-center bg-gradient-to-b from-purple-400 to-purple-500 text-white p-6">
            <h3 className="sarabun-font text-bold">นับถอยหลังเปิดภาคเรียนที่ 2</h3>
            <CountDown />
          </div>
        </div>
      </main>
      <FooterComponent />
    </div>
  )
}
