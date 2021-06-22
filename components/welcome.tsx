import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '../shared/authContext'
const ModalComponent = dynamic(() => import('./modal'))

export default function WelcomeComponent(): JSX.Element {
  const { setWelcome } = useAuth()
  const [index, setIndex] = useState(0)
  const [show, setShow] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setShow(true)
    }, 2500)
  }, [])
  function next() {
    if (index !== 4) return setIndex((i) => ++i)
    setShow(false)
    setWelcome(true)
  }
  function prev() {
    setIndex((i) => --i)
  }
  return (
    <ModalComponent
      closable={false}
      size="md:max-w-2xl"
      title="ยินดีต้อนรับสู่ PM-RianArai"
      show={show}
      onClose={() => index === 4 && setShow(false)}
      titleClass="bg-yellow-400 text-gray-900 bg-opacity-80 creative-font font-bold"
    >
      <div className="px-6 py-4">
        <div
          className={`${
            index === 0 ? 'flex' : 'hidden'
          } flex-col items-center justify-center font-light gap-2`}
        >
          <Image src="/banner_3105.jpg" width={400} height={209} priority={true} />
          <h4 className="font-medium text-xl">ยินดีต้อนรับสู่ PM-RianArai โฉมใหม่!</h4>
          <span>กดถัดไปเพื่อดำเนินการต่อ</span>
        </div>
        <div
          className={`${
            index === 1 ? 'md:grid flex' : 'hidden'
          } md:grid-cols-2 flex-col items-center justify-center font-light gap-4`}
        >
          <div className="max-w-sm py-2">
            <video muted autoPlay loop className="rounded-lg border">
              <source src="/v2/home_large.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="space-y-4 flex flex-col">
            <h4 className="font-medium text-xl">เข้าเรียนได้อย่างรวดเร็ว</h4>
            <span>
              เมื่อถึงเวลา ระบบจะแสดงคาบเรียนโดยอัตโนมัติ ที่ต้องทำก็คือแค่กดปุ่มสีฟ้านั่น ใช่เลย
            </span>
            <span>อ๋อ เข้าก่อนเวลาได้สูงสุดถึง 10 นาทีเลยนะ</span>
          </div>
        </div>
        <div
          className={`${
            index === 2 ? 'md:grid flex' : 'hidden'
          } md:grid-cols-2 flex-col-reverse items-center justify-center font-light gap-4`}
        >
          <div className="space-y-4 flex flex-col">
            <h4 className="font-medium text-xl">ตรวจสอบงานได้จากที่เดียว</h4>
            <span>
              เพียงเชื่อมต่อบัญชีกับ Google Classroom คุณก็สามารถตรวจสอบงานทั้งหมดได้อย่างง่ายดาย
            </span>
            <span>ในอนาคตจะรองรับการเชื่อมต่อมากกว่า 1 บัญชี และการแสดงผลแบบปฏิทินด้วยนะ</span>
          </div>
          <div className="max-w-sm py-2 border rounded-lg">
            <Image src="/v2/work_square.jpeg" width={300} height={300} priority={true} />
          </div>
        </div>
        <div
          className={`${
            index === 3 ? 'flex' : 'hidden'
          } p-4 flex-col items-center justify-center font-light gap-4`}
        >
          <h4 className="font-medium text-2xl">เรียนชุมนุมออนไลน์?</h4>
          <span className="text-center max-w-md">
            ในวันที่ 28-30 มิถุนายนที่จะถึงนี้ จะมีการลงทะเบียนชุมนุมผ่านระบบออนไลน์ขึ้น ไม่ต้องห่วง
            คุณสามารถเข้าได้จากใน <b>PM-RianArai</b> ได้ทันที
          </span>
          <span className="text-center max-w-md">รอติดตามในเร็ว ๆ นี้ มาแน่นอน</span>
          <div className="py-2 border rounded-lg">
            <Image src="/v2/chumnum.png" width={500} height={128} priority={true} />
          </div>
        </div>
        <div
          className={`${
            index === 4 ? 'flex' : 'hidden'
          } flex-col items-center justify-center font-light gap-8 p-4`}
        >
          <h4 className="font-medium text-2xl">แค่นี้แหละ !</h4>
          <span className="text-center max-w-md">
            ขอให้ใช้ชีวิตในแต่ละวันอย่างมีความสุขนะ หากมีปัญหาอะไรสามารถติดต่อได้ที่{' '}
            <a className="underline text-blue-500 hover:text-blue-600 font-medium" href="/support">
              PM-RianArai Support Form
            </a>
          </span>
          <span className="text-center font-medium">
            อัพเดทข่าวสารได้ทาง{' '}
            <a
              className="underline text-blue-500 hover:text-blue-600"
              target="_blank"
              rel="noopener noreferer"
              href="https://twitter.com/lemascth"
            >
              Official Twitter Account (@lemascth)
            </a>
          </span>
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
          {index === 4 ? 'เสร็จสิ้น' : 'ถัดไป'}
        </button>
      </div>
    </ModalComponent>
  )
}
