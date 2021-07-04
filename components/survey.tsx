import { useEffect, useState } from 'react'
import { doc, increment, updateDoc } from 'firebase/firestore'
import { db } from '@/shared/firebase'
import ModalComponent from './modal'

const list = [
  { text: 'ไม่เคยเกิดปัญหานี้ และสามารถเข้าเรียนได้ปกติ', name: 'ok' },
  { text: 'เคยเกิดปัญหา แต่ตอนนี้สามารถเข้าเรียนได้ปกติแล้ว', name: 'usedto' },
  { text: 'ปัญหายังคงอยู่ ไม่สามารถเข้าเรียนได้', name: 'notok' },
  { text: 'ไม่ได้ใช้อุปกรณ์ iPad', name: 'nodevice' },
  { text: 'ไม่ทราบ เนื่องจากยังไม่ได้ทดลอง', name: '' },
]

export default function SurveymeComponent(): JSX.Element {
  const [show, setShow] = useState(false)
  const [answer, setAnswer] = useState(-1)
  useEffect(() => {
    if (!localStorage.getItem('surveyiOS')) {
      setTimeout(() => {
        setShow(true)
      }, 2500)
    }
  }, [])
  function selectedClass(i): string {
    const baseClass =
      'border-blue-500 border px-4 py-2 hover:bg-blue-400 rounded text-sm focus:outline-none '
    return i === answer ? baseClass + 'bg-blue-500 text-white' : baseClass
  }
  async function submit(): Promise<void> {
    const d = {}
    if (answer !== -1 && answer !== 4) {
      d[list[answer].name] = increment(1)
      localStorage.setItem('surveyiOS', new Date().valueOf().toString())
    }
    await updateDoc(doc(db, 'survey', 'ioscheck'), {
      ...d,
      views: increment(1),
    })
    setShow(false)
  }
  return (
    <ModalComponent
      closable={true}
      size="md:max-w-2xl"
      title="กรุณาตอบแบบสอบถาม"
      show={show}
      onClose={() => setShow(false)}
      titleClass="bg-yellow-400 text-gray-900 bg-opacity-80 creative-font font-bold"
    >
      <div className="px-6 py-4">
        <div
          className={`flex flex-col items-center justify-center font-light gap-4 py-4 text-center`}
        >
          <h3 className="text-xl font-medium">สำคัญ : การเข้าเรียนผ่านอุปกรณ์ iOS</h3>
          <span className="text-sm text-gray-500">
            หากกดปิดหน้าจอนี้ ครั้งต่อไปที่เข้าใช้งานระบบจะขึ้นข้อความอีกครั้งจนกว่าจะเลือกตอบแล้ว
          </span>
          <span>
            PM-RianArai ได้รับการแจ้งปัญหาเมื่อเร็ว ๆ นี้ว่าอุปกรณ์ iPad
            บางอุปกรณ์ไม่สามารถเข้าเรียนได้
          </span>
          <span>
            Apple ได้เปลี่ยนการจัดหมวดหมู่อุปกรณ์ โดยให้ iPad เวอร์ชั่นใหม่ ๆ อยู่ในหมวด Mac OS
            ทำให้ระบบเกิดข้อผิดพลาด แสดงข้อความ <b>Safari ไม่สามารถเปิด URL นี้ได้</b>
          </span>
          <span>
            อย่างไรก็ตาม ได้ดำเนินการแก้ไขไปแล้วในวันที่ 22 มิ.ย. แต่ในบางเครื่องก็อาจจะยังขึ้นอยู่
          </span>
          <span className="font-medium text-red-500">
            กรุณาตอบตามความเป็นจริง แล้วกดปุ่ม <b>ยืนยัน</b> ด้านล่าง
          </span>
          <div className="flex flex-col gap-4">
            {list.map((l, i) => (
              <button key={l.name} className={selectedClass(i)} onClick={() => setAnswer(i)}>
                {l.text}
              </button>
            ))}
          </div>
          <button
            onClick={() => submit()}
            className="btn text-lg text-white px-4 py-2 bg-apple-500 from-apple-500 to-apple-600 ring-apple-600"
          >
            ยืนยันและปิดหน้าจอนี้
          </button>
        </div>
      </div>
    </ModalComponent>
  )
}
