import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs'
import { Disclosure, Transition } from '@headlessui/react'
import { ChevronUpIcon, DotsVerticalIcon, DownloadIcon } from '@heroicons/react/outline'

import { useAuth } from '@/shared/authContext'
import HeaderComponent from '@/components/layout/header'
import dayjs from 'dayjs'

type InstallPromoProps = {
  children: React.ReactNode
  index: number
  mobile: boolean
  className: string
}
function InstallPromo({ children, index, mobile, className }: InstallPromoProps): JSX.Element {
  return (
    <div className="flex flex-col md:flex-row py-4 space-y md:space-y-0 md:space-x-4">
      <div className="flex-grow flex flex-col font-medium space-y-2">
        <h3>
          {index}. ที่{' '}
          <Link href="/">
            <a
              target="_blank"
              rel="noopener noreferrer"
              title="หน้าหลัก"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              หน้าหลัก
            </a>
          </Link>{' '}
          เลื่อนไปด้านล่างจะมีข้อความดังรูป เลือก <b>ติดตั้งเลย</b>
        </h3>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-green-900 bg-green-100 rounded-lg hover:bg-green-200 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75">
                <span>หากไม่มีข้อความขึ้น</span>
                <ChevronUpIcon
                  className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-green-500`}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-300 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-150 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel
                  className={'font-normal border px-4 pt-4 pb-2 text-sm text-gray-500 ' + className}
                >
                  {children}
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
      <div className="py-4 flex flex-col items-center justify-start">
        <Image
          className="rounded-lg"
          src={'/install/installpromo' + (mobile ? '_mobile' : '') + '.png'}
          width={mobile ? 300 : 668}
          height={mobile ? 229 : 95}
        />
      </div>
    </div>
  )
}

export default function Install(): JSX.Element {
  const { metadata, setInsider } = useAuth()
  // const router = useRouter()
  const [index, setIndex] = useState(0)
  /*const [show, setShow] = useState(false)
   useEffect(() => {
    let showTime = null
    if (showTime) clearTimeout(showTime)
    if (/Android/i.test(navigator.userAgent)) {
      setIndex(1)
      /* if (isPWA && isPWA()) {
        // User already use PWA, redirect to PWA
        router.replace('/')
        return
      }
    }
    if (/Windows/i.test(navigator.userAgent)) {
      setIndex(0)
    }
    showTime = setTimeout(() => setShow(true), 1000)
  }, [isPWA, router])
  if (!show) return <div></div>*/
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>Install App : PM-RianArai</title>
        <meta property="og:url" content="https://pm-rianarai.vercel.app/install" />
        <meta property="og:title" content="ติดตั้งแอพพลิเคชั่น PM-RianArai" />
        <meta
          property="og:description"
          content="ติดตั้งแอพพลิเคชั่นเพื่อการเข้าเรียนที่สะดวกและรวดเร็วขึ้น"
        />
      </Head>
      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent />
        <div className="px-8 py-4 text-center font-light">
          ติดตั้งแอพพลิเคชั่นลงในอุปกรณ์เพื่อการเข้าใช้งานที่รวดเร็วกว่า
          รับการแจ้งเตือนการเข้าเรียนก่อนเวลา และฟีเจอร์อื่น ๆ อีกมากมาย
        </div>
        <div className="sm:mx-16 mx-4 p-4">
          <Tabs selectedIndex={index} onSelect={(index) => setIndex(index)}>
            <TabList>
              <Tab>PC</Tab>
              <Tab>Android</Tab>
              <Tab>iOS/iPadOS</Tab>
            </TabList>
            <TabPanel>
              <div className="space-y-3 pb-4 border-b max-w-5xl">
                <h2 className="font-medium text-2xl">(ใหม่) PM-RianArai PC - Early Access</h2>
                <p className="">
                  PM-RianArai PC เป็น PM-RianArai
                  ในรูปแบบของโปรแกรมที่สามารถติดตั้งลงในคอมพิวเตอร์ได้
                  โดยมีหน้าตาและฟีเจอร์เช่นเดียวกับ PM-RianArai บนเว็บ แต่มีฟีเจอร์อื่น ๆ เพิ่มเติม
                  อาทิเช่น
                </p>
                <ul className="list-disc pl-10 space-y-2 bg-gray-100 p-4 rounded w-full">
                  <li>เข้าเรียนได้จากหน้า Desktop ได้ทันที</li>
                  <li>การแจ้งเตือนใน Windows ก่อนเข้าเรียน 5 นาที</li>
                  <li>บันทึกภาพหน้าจอจาก Zoom และจัดระเบียบภาพให้โดยอัตโนมัติ</li>
                  <li>
                    Zoom Mini Window ใช้งานแอพพลิเคชั่นอื่นระหว่างเรียนได้ (อยู่ในระหว่างการทดลอง)
                  </li>
                </ul>
                <p>
                  คุณสามารถลงทะเบียนล่วงหน้าเพื่อรับสิทธิติดตั้งก่อนเปิดใช้งานจริง (Early Access)
                  และแจ้งปัญหาต่าง ๆ เพื่อปรับปรุงและพัฒนาได้โดยตรง
                </p>
                <div className="flex flex-row gap-4 items-center">
                  <button
                    disabled={metadata ? metadata.insider === true : true}
                    onClick={() => setInsider()}
                    className="px-4 text-white btn py-2 ring-blue-500 bg-blue-500 from-blue-500 to-blue-600 disabled:bg-gray-200 disabled:text-gray-500 disabled:from-gray-200 disabled:to-gray-200 disabled:cursor-not-allowed"
                  >
                    ลงทะเบียนล่วงหน้า
                  </button>
                  {metadata && metadata.insider && (
                    <span className="text-blue-500 text-sm sarabun-font">
                      คุณได้ลงทะเบียนไปแล้วเมื่อ{' '}
                      {dayjs(
                        metadata.insiderAt.toDate ? metadata.insiderAt.toDate() : metadata.insider
                      ).format('DD/MM/YYYY HH:mm น.')}
                    </span>
                  )}
                </div>
              </div>
              <div className="py-4 space-y-2">
                <h2 className="font-medium text-2xl" id="install">
                  การติดตั้งผ่านเบราวเซอร์ (แบบ PWA)
                </h2>
                <p>
                  คอมพิวเตอร์ที่ใช้ Windows, MacOS และใช้เบราวเซอร์รุ่นใหม่ ๆ อย่าง Google Chrome
                  หรือ Microsoft Edge สามารถใช้งานได้ทันที
                </p>
                <InstallPromo className="sm:max-w-md" mobile={false} index={1}>
                  <>
                    <span className="py-4">
                      ตรวจสอบที่ด้านบน Address Bar ว่ามีปุ่มเหล่านี้หรือไม่ หากมี ให้คลิกที่ปุ่ม
                    </span>
                    <Image className="rounded-lg" src="/install/pc1.png" width={512} height={396} />
                    <span className="py-4">
                      หากไม่มีข้อความเหล่านี้ขึ้น แสดงว่าคุณกำลังใช้เบราวเซอร์ที่ไม่รองรับ PWA
                      กรุณาเปลี่ยนไปใช้เบราวเซอร์ที่รองรับ
                    </span>
                  </>
                </InstallPromo>
                <div className="md:grid md:grid-cols-2 md:divide-x">
                  <div className="max-w-lg flex flex-col justify-center">
                    <h3 className="font-medium text-center">2. ติดตั้งแอพพลิเคชั่นโดยกด Install</h3>
                    <Image className="rounded-lg" src="/install/pc2.png" width={600} height={600} />
                  </div>
                  <div className="max-w-lg flex flex-col justify-start items-center md:space-y-4 space-y-2">
                    <h3 className="font-medium text-center px-4">
                      3. เมื่อติดตั้งเรียบร้อย โปรแกรมจะเปิดขึ้นมาโดยอัตโนมัติเป็นอันเสร็จ
                    </h3>
                    <div>
                      <Image
                        className="rounded-lg"
                        src="/install/shortcut.png"
                        width={126}
                        height={158}
                      />
                    </div>
                    <span className="text-gray-500">ไอคอนโปรแกรมที่หน้า Desktop</span>
                    <div>
                      <Image
                        className="rounded-lg"
                        src="/install/start.png"
                        width={245}
                        height={75}
                      />
                    </div>
                    <span className="text-gray-500">ไอคอนโปรแกรมที่ Start Menu</span>
                  </div>
                </div>
                <h2 className="font-medium text-2xl py-1" id="open">
                  การเข้าใช้งาน
                </h2>
                <p>
                  สามารถเรียกใช้งานได้จากหน้า Shortcut ของโปรแกรมที่ตำแหน่งต่าง ๆ เช่น Desktop
                  ได้ทันที
                </p>
              </div>
            </TabPanel>
            <TabPanel>
              <h2 className="font-medium text-2xl py-1" id="install">
                การติดตั้ง
              </h2>
              <p>
                อุปกรณ์มือถือที่ใช้เบราวเซอร์ <b>Google Chrome (แนะนำ)</b> และ Samsung Internet
                สามารถใช้งานเป็นแอพพลิเคชั่นได้ทันที
                <br />
                หากใช้เบราวเซอร์อื่น ๆ ไม่รับประกันการใช้งาน ควรเปิดใน Google Chrome จะดีกว่า
              </p>
              <div className="flex flex-col py-8">
                <div>
                  <h3 className="font-medium">
                    1. หากเปิดในแอพพลิเคชั่นภายนอก เช่น LINE, Instagram, Facebook
                    กรุณาเปิดในเบราวเซอร์พื้นฐานก่อน <br />
                    <span className="text-gray-500 sm:px-2 py-2 text-sm">
                      เครื่องหมาย <DotsVerticalIcon className="w-5 h-5 inline" /> &#x279D; &nbsp;
                      Open In ... / เปิดใน ...
                    </span>
                  </h3>
                  <div className="md:flex-row justify-center items-center flex flex-col item-center py-4 gap-8">
                    <div className="md:max-w-sm md:w-auto w-64">
                      <Image
                        className="rounded-lg"
                        src="/install/line.jpg"
                        width={300}
                        height={225}
                      />
                    </div>
                    <div className="md:w-auto w-64 md:max-w-sm">
                      <Image
                        className="rounded-lg"
                        src="/install/instagram.jpg"
                        width={300}
                        height={225}
                      />
                    </div>
                  </div>
                </div>
                <InstallPromo className="flex flex-col gap-4" mobile={true} index={2}>
                  <>
                    <span>
                      <b>สำหรับ Google Chrome</b>
                      <p>
                        ไปที่ <DotsVerticalIcon className="w-5 h-5 inline" /> &#x279D; &nbsp;
                        ติดตั้งแอพ / Install App
                      </p>
                      <div className="max-w-sm py-2">
                        <video muted autoPlay loop>
                          <source src="/install/chrome_pwa.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </span>
                    <span>
                      <b>สำหรับ Samsung Internet</b>
                      <p>
                        กดที่ไอคอน <DownloadIcon className="w-5 h-5 inline" />
                      </p>
                      <div className="max-w-sm py-2">
                        <video muted autoPlay loop>
                          <source src="/install/samsung_pwa.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </span>
                  </>
                </InstallPromo>
                <div className="md:grid md:grid-cols-2 md:divide-x">
                  <div className="flex flex-col justify-center items-center">
                    <h3 className="font-medium text-center">
                      2. ติดตั้งแอพพลิเคชั่นโดยกดติดตั้ง/Install
                      <div className="max-w-sm py-2">
                        <Image
                          className="rounded-lg"
                          src="/install/chrome_prompt.jpg"
                          width={960}
                          height={540}
                        />
                      </div>
                      <div className="max-w-sm py-2">
                        <Image
                          className="rounded-lg"
                          src="/install/samsung_prompt.jpg"
                          width={960}
                          height={540}
                        />
                      </div>
                    </h3>
                  </div>
                  <div className="max-w-lg flex flex-col justify-start items-center md:space-y-4 space-y-2">
                    <h3 className="font-medium text-center md:px-8 px-4">
                      3. เมื่อติดตั้งเรียบร้อย จะมีแอพพลิเคชั่นที่หน้าจอเป็นอันเสร็จ
                    </h3>
                    <div className="max-w-sm">
                      <Image
                        className="rounded-lg"
                        src="/install/launcher.jpg"
                        width={480}
                        height={270}
                      />
                    </div>
                    <span className="text-gray-500">ไอคอนแอพพลิเคชั่น</span>
                  </div>
                </div>
              </div>
              <h2 className="font-medium text-2xl py-1" id="open">
                การเข้าใช้งาน
              </h2>
              <p>
                สามารถเรียกใช้งานได้จากหน้าจอหลักได้ทันที
                หรือหากเข้าเว็บไซต์จากเบราวเซอร์พื้นฐานอยู่แล้วให้เลือก <b>เปิดในแอพ</b>
              </p>
            </TabPanel>
            <TabPanel>
              <h2 className="font-medium text-2xl py-1" id="install">
                การติดตั้ง
              </h2>
              <p>
                สำหรับอุปกรณ์ iOS/iPadOS จะมีบางฟีเจอร์ที่ขาดหายไป (เนื่องจากข้อจำกัดทางเทคนิค)
                แต่ยังคงสามารถเพิ่มแอพพลิเคชั่นไปยังหน้าจอหลักได้ โดยดูจากคลิปวิดิโอต่อไปนี้
              </p>

              <div className="mx-auto p-4">
                <iframe
                  className="w-full"
                  title="iOS PWA Guide"
                  src="https://player.vimeo.com/video/562619344?autoplay=1&loop=1&&muted=1autopause=0"
                  width="640"
                  height="564"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
              <h2 className="font-medium text-2xl py-1" id="open">
                การเข้าใช้งาน
              </h2>
              <p>สามารถเรียกใช้งานได้จากหน้าจอหลักได้ทันที (ไม่มีขึ้นใน App Library)</p>
            </TabPanel>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
