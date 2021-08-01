import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useAuth } from '@/shared/authContext'
const ModalComponent = dynamic(() => import('./modal'))

export default function WhatsNewComponent(): JSX.Element {
  const { setWelcome } = useAuth()
  const [index, setIndex] = useState(0)
  const [show, setShow] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setShow(true)
    }, 2500)
  }, [])
  function next(): void {
    if (index !== 1) return setIndex((i) => ++i)
    setShow(false)
    setWelcome(true)
  }
  function prev(): void {
    setIndex((i) => --i)
  }
  return (
    <ModalComponent
      closable={false}
      size="md:max-w-3xl"
      title="มีอะไรใหม่ใน PM-RianArai เวอร์ชั่น 2.2"
      show={show}
      onClose={() => index === 1 && next()}
      titleClass="bg-yellow-400 text-gray-900 bg-opacity-80 creative-font font-bold"
    >
      <div className="px-6 py-4">
        <div
          className={`${
            index === 0 ? 'md:grid flex' : 'hidden'
          } md:grid-cols-2 flex-col-reverse items-center justify-center font-light gap-4`}
        >
          <div className="space-y-4 flex flex-col">
            <h4 className="font-medium text-2xl">เรื่องงานเป็นสิ่งที่สำคัญ</h4>
            <span>
              เราจึงปรับปรุงและพัฒนาใหม่ทั้งหมดเพื่อให้คุณวางแผนและ Productive มากยิ่งขึ้น
              ไม่ว่าจะเป็น
            </span>
            <ul className="list-disc pl-4 space-y-2 max-w-2xl">
              <li>หน้างานที่ได้รับปรับการแสดงผลแบบใหม่</li>
              <li>หน้าหลักที่แสดงสรุปจำนวนงานต่าง ๆ</li>
              <li>
                <b>สิ่งสำคัญ</b> และ <b>ที่จัดเก็บ</b> เพื่อแยกงานอย่างเป็นระเบียบ
              </li>
              <li>สามารถเพิ่มงานที่ไม่ได้สั่งใน Google Classroom ลงในระบบเองได้</li>
              <li>สามารถเพิ่มบัญชีมากกว่า 1 บัญชีได้แล้ว โดยไปที่หน้าการตั้งค่า</li>
            </ul>
          </div>
          <div className="max-w-sm py-2 border rounded-lg">
            <Image src="/v2/work_v2.2.png" width={400} height={400} />
          </div>
        </div>
        <div className={`${index === 1 ? 'flex' : 'hidden'} flex-col font-light gap-4 p-4`}>
          <div className="flex flex-row items-center gap-4 select-none">
            <div className="flex flex-row items-center gap-2 pb-4">
              <Image src="/logo.png" height={50} width={50} />
              <div className="flex flex-col">
                <span className="text-sm text-center">PM</span>
                <h2 className="text-2xl header-font">
                  <span className="text-red-500">R</span>ian
                  <span className="text-purple-500">A</span>rai
                </h2>
              </div>
            </div>
            <h4 className="font-medium text-2xl">PC Version</h4>
          </div>
          <span className="text-red-500 font-medium">
            Early Access ลงทะเบียนล่วงหน้าสำหรับทดลองใช้งานระยะแรก จำกัดไม่เกิน 50 คนเท่านั้น
          </span>
          <ul className="list-disc pl-10 space-y-2 max-w-2xl bg-gray-100 p-4 rounded">
            <li>เข้าเรียนได้จากหน้า Desktop เพียงคลิกเดียว</li>
            <li>การแจ้งเตือนใน Windows ก่อนเข้าเรียน 5 นาที</li>
            <li>บันทึกภาพหน้าจอจาก Zoom ได้ทันที (ไม่ต้องยกกล้องมาถ่าย!)</li>
            <li>Zoom Mini Window ใช้งานแอพพลิเคชั่นอื่นระหว่างเรียนได้ (เบต้า)</li>
          </ul>
          <span>ดูรายละเอียดเพิ่มเติมได้ที่ปุ่ม PM-RianArai PC ที่หน้าหลัก</span>
        </div>
      </div>
      <div className="bg-gray-100 px-6 py-3 flex gap-2 items-center justify-end">
        {index > 0 && (
          <button
            onClick={() => prev()}
            className="px-4 py-2 rounded text-white bg-blue-500 from-blue-500 to-blue-600 hover:bg-gradient-to-b"
          >
            กลับ
          </button>
        )}
        <button
          onClick={() => next()}
          className="px-4 py-2 rounded text-white bg-apple-500 from-apple-500 to-apple-600 hover:bg-gradient-to-b"
        >
          {index === 1 ? 'เสร็จสิ้น' : 'ถัดไป'}
        </button>
      </div>
    </ModalComponent>
  )
}
