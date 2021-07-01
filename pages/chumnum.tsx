import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs'
import { useAuth } from '../shared/authContext'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import Fuse from 'fuse.js'
import {
  DocumentDuplicateIcon,
  ClipboardCheckIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
} from '@heroicons/react/outline'
import Tippy from '@tippyjs/react'
import useSWR from 'swr'
import { useWindowWidth } from '@react-hook/window-size/throttled'
import { ChumnumData, ChumnumResult } from './api/chumnum'
import LayoutComponent, { CONTAINER, HEADER } from '../components/layout'
import SelectBox, { SelectData } from '../components/select'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
const ModalComponent = dynamic(() => import('../components/modal'))
const MarkDownComponent = dynamic(() => import('../components/markdown'))
import { useCollection } from 'swr-firestore-v9'

dayjs.extend(weekday)
type ChumnumFilter = {
  target: number[]
}

const fetcher = (url) => axios.get<ChumnumResult>(url).then((res) => res.data)
type TimeRange = {
  startTime: number
  endTime: number
}

export const time: SelectData<TimeRange>[] = [
  {
    name: 'สัปดาห์นี้',
    startTime: dayjs().weekday(0).hour(0).minute(0).second(0).unix(),
    endTime: dayjs().weekday(7).hour(0).minute(0).second(0).unix(),
  },
  {
    name: 'อีก 7 วัน',
    startTime: dayjs().hour(0).minute(0).second(0).unix(),
    endTime: dayjs().add(8, 'days').hour(0).minute(0).second(0).unix(),
  },
  {
    name: 'ก่อนหน้านี้',
    startTime: dayjs('2021-06-01').unix(),
    endTime: dayjs().unix(),
  },
  {
    name: 'อีก 30 วัน',
    startTime: dayjs().subtract(1, 'month').hour(0).minute(0).second(0).unix(),
    endTime: dayjs().add(1, 'month').hour(0).minute(0).second(0).unix(),
  },
  {
    name: 'นานกว่านั้น',
    startTime: dayjs().add(1, 'month').hour(0).minute(0).second(0).unix(),
    endTime: dayjs('2022-06-01').unix(),
  },
]

const filterSet: SelectData<ChumnumFilter>[] = [
  {
    name: 'ใช้ระดับชั้นปัจจุบัน',
    target: [-1],
  },
  {
    name: 'แสดงทุกระดับชั้น',
    target: [],
  },
  {
    name: 'มัธยมศึกษาตอนต้น',
    target: [1, 2, 3],
  },
  {
    name: 'มัธยมศึกษาตอนปลาย',
    target: [4, 5, 6],
  },
]
const autoRefresh = true

export default function ChumnumPage(): JSX.Element {
  const router = useRouter()
  const width = useWindowWidth()
  const { metadata } = useAuth()
  const [search, setSearch] = useState<string>('')
  const [copy, setCopy] = useState(false)
  const [detail, setDetail] = useState<ChumnumData | null>(null)
  const [filteredData, setFiltered] = useState<ChumnumData[] | null>(null)
  const [filter, setFilter] = useState<SelectData<ChumnumFilter>>(filterSet[1])
  // We still need to preserve the chumnum api because we will update it constantly.
  const { data: autoFetch, error: autoFetchError } = useSWR('/api/chumnum', fetcher, {
    refreshInterval: autoRefresh ? 60000 : undefined,
  })

  const { data, error } = useCollection<ChumnumData>('chumnum', {
    listen: true,
  })
  useEffect(() => {
    if (metadata) setFilter(filterSet[0])
  }, [metadata])

  useEffect(() => {
    ;(async () => {
      if (!data) return
      const list = data.filter((d) => {
        if (filter.target.length == 0) return true
        // Use metadata
        if (filter.target[0] === -1)
          return metadata && d.target.includes(parseInt(metadata.class.toString().slice(0, 1)))
        for (let i = 0; i < filter.target.length; i++) {
          if (d.target.includes(filter.target[i])) return true
        }
        return false
      })
      if (search.trim() === '') return setFiltered(list)
      setFiltered(
        new Fuse(list, { threshold: 0.3, keys: ['name', 'teacher', 'room'] })
          .search(search.trim())
          .map((d) => d.item)
      )
    })()
  }, [data, search, filter, metadata])

  function generateClass(target: number[]): string {
    if (target.length === 1) return 'ม.' + target[0]
    return 'ม.' + target[0] + ' - ม.' + target[target.length - 1]
  }

  return (
    <div className="overflow-hidden min-h-screen flex flex-col dark:bg-gray-900 dark:text-white items-center justify-center">
      <Head>
        <title>ชุมนุม - PM-RianArai</title>
        <meta name="description" content="เข้าเรียนทุกวิชาได้จากที่เดียว" />
        <meta property="og:url" content="https://pm-rianarai.vercel.app" />
        <meta property="og:title" content="PM Rianarai - เรียนอะไร" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>
      <LayoutComponent>
        <div className={CONTAINER + 'space-y-6 mb-20'}>
          <div
            className={
              (width >= 350 ? 'flex-row' : 'flex-col') + ' flex justify-center gap-4 ' + HEADER
            }
          >
            <div className="flex flex-row flex-1 flex-grow items-center justify-center">
              <button onClick={() => router.back()} className="focus:outline-none">
                <ArrowLeftIcon className="w-8 h-8" />
              </button>
              <h1 className="pl-4 flex-grow">ชุมนุม</h1>
            </div>
            <div
              className={
                (!autoFetchError
                  ? autoFetch
                    ? 'text-green-500'
                    : 'text-blue-500'
                  : 'text-red-500') +
                ' flex justify-end items-end flex-col sarabun-font text-green-500 font-bold'
              }
            >
              <span className="text-sm text-gray-600 dark:text-gray-300 kanot-font font-normal py-1.5">
                สถานะของระบบลงทะเบียน
              </span>
              {!autoFetchError
                ? autoFetch
                  ? autoFetch.status === 'intime'
                    ? 'ออนไลน์'
                    : 'ปิดการลงทะเบียน'
                  : 'กำลังโหลด'
                : 'ออฟไลน์'}
              {autoRefresh && (
                <span className="text-xs text-gray-400 kanot-font font-normal py-1.5">
                  อัพเดทข้อมูลอัตโนมัติทุก 60 วินาที
                </span>
              )}
            </div>
          </div>
          <div className="p-4 flex md:flex-row flex-col items-center gap-4 justify-start bg-green-200 text-green-700 rounded-lg sarabun-font font-light">
            <span className="flex flex-col md:flex-grow px-2 text-center md:text-left">
              <b className="font-bold md:py-1 py-2">
                ระบบลงทะเบียนชุมนุม
                {dayjs().unix() > dayjs('2021/06/25 13:00:00').unix()
                  ? 'รอบที่ 2 จะเปิดในวันที่ 28 - 30 มิถุนายน 2564 เวลา 08:00 น. เป็นต้นไป'
                  : 'รอบที่ 1 จะเปิดในวันที่ 25 มิถุนายน 2564 เวลา 12:00 - 13.00 น.'}
              </b>
              เว็บไซต์ PM-RianArai ไม่ได้ให้บริการลงทะเบียนโดยตรง
              ข้อมูลในหน้านี้จัดทำขี้นเพื่อใช้ในการอ้างอิงเท่านั้น
            </span>
            <a
              title="เข้าสู่ระบบลงทะเบียนกิจกรรมชุมนุมออนไลน์"
              href="https://wpm.clubth.com/index.php"
              target="_blank"
              rel="noreferer noopener"
              className="flex-shrink-0 h-12 flex items-center justify-center btn text-white font-bold bg-blue-500 from-blue-500 to-blue-600 focus:ring-blue-600 px-4 py-2"
            >
              เข้าสู่เว็บลงทะเบียน <ExternalLinkIcon className="h-6 w-6 inline -mt-1 ml-2" />
            </a>
          </div>
          <span className="italic px-4 text-gray-600 dark:text-gray-400">
            คลิกที่ปุ่มด้านล่างเพื่อสลับเมนูที่ต้องการ
          </span>
          <Tabs>
            <TabList>
              <Tab>รายชื่อชุมนุม</Tab>
              <Tab>รายละเอียดการลงทะเบียน</Tab>
              <Tab>ขั้นตอนการลงทะเบียน</Tab>
            </TabList>
            <TabPanel>
              <div className="flex flex-col xl:grid-cols-4 sm:grid-cols-2 sm:grid rounded bg-gray-100 dark:bg-gray-600 md:p-8 p-4 gap-4 md:gap-8 font-medium items-center justify-center">
                <div className="flex w-full flex-col gap-2">
                  <label htmlFor="search">ค้นหาชุมนุม</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="search"
                    name="search"
                    placeholder="ค้นหาจากชื่อ ห้อง อาจารย์"
                    className="dark:bg-gray-800 rounded-lg w-full mt-2 py-2 pl-3 font-light px-4 shadow-md sm:text-sm focus:outline-none"
                  />
                </div>
                <div className="flex w-full flex-col gap-2">
                  <label>ระดับชั้น</label>
                  <SelectBox
                    className="w-full"
                    data={filterSet}
                    selected={filter}
                    onChange={setFilter}
                  />
                </div>
                {filteredData && (
                  <div className="flex flex-col gap-2 items-center text-center text-sm">
                    <span>ลงทะเบียนจากชุมนุมที่ค้นหา ({filteredData.length} ชุมนุม)</span>
                    <b className="text-3xl text-gray-600 dark:text-gray-300 font-medium">
                      <span className="text-green-500">
                        {filteredData.reduce((a, b) => a + b.current, 0)}
                      </span>
                      /{filteredData.reduce((a, b) => a + b.all, 0)}
                    </b>
                  </div>
                )}
                {data && (
                  <div className="flex flex-col gap-2 items-center text-center text-sm">
                    <span>ลงทะเบียนจากชุมนุมทั้งหมด</span>
                    <b className="text-3xl text-gray-600 dark:text-gray-300 font-medium">
                      <span className="text-green-500">
                        {data.reduce((a, b) => a + b.current, 0)}
                      </span>
                      /{data.reduce((a, b) => a + b.all, 0)}
                    </b>
                  </div>
                )}
              </div>
              <div
                className={
                  (filteredData && filteredData.length !== 0
                    ? 'lg:grid-cols-3 md:grid-cols-2 '
                    : '') + 'md:grid flex flex-col py-4 gap-8'
                }
              >
                {filteredData &&
                  filteredData.map((d) => (
                    <button
                      onClick={() => {
                        console.log(d)
                        setDetail(d)
                      }}
                      key={d.name}
                      className="focus:outline-none border dark:border-gray-600 shadow-md rounded p-4 bg-white dark:bg-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 cursor-pointer flex flex-col justify-center space-y-2"
                    >
                      <div className="flex w-full flex-row">
                        <div className="flex flex-col space-y-2 pr-2 text-sm flex-grow items-start">
                          <h3 className="text-xl sarabun-font font-bold text-left">{d.name}</h3>
                          <span className="font-medium text-blue-500">
                            ระดับชั้น: {generateClass(d.target)}
                          </span>
                        </div>
                        <div className="flex flex-shrink-0 flex-col space-y-2 text-sm items-end font-bold">
                          <b
                            className={
                              'text-3xl ' +
                              (d.all - d.current === 0 ? 'text-red-500' : 'text-green-500')
                            }
                          >
                            {d.all - d.current}
                          </b>
                          <span className="sarabun-font">ที่ว่างอยู่</span>
                        </div>
                      </div>
                      <div className="flex w-full flex-col items-start space-y-1">
                        <span className="font-light">{d.room}</span>
                        <span className="dark:text-gray-400 text-gray-600 text-left">
                          โดย {d.teacher.join(', ')}
                        </span>
                        <span className="text-red-500 py-2">คลิกเพื่อดูรายละเอียดเพิ่มเติม</span>
                      </div>
                    </button>
                  ))}
                {filteredData && filteredData.length === 0 && (
                  <div className="flex items-center justify-center h-32 w-full">ไม่มีข้อมูล</div>
                )}
              </div>
            </TabPanel>
            <TabPanel>
              <div className="px-4">
                <h2 className="text-xl creative-font font-bold flex-grow py-1">
                  หลักการลงทะเบียนชุมนุม
                </h2>
                <span className="italic sarabun-font text-sm">
                  อ้างอิงจาก{' '}
                  <a
                    title="คำชี้แจงในการเลือกชุมนุม"
                    href="https://www.instagram.com/p/CQfRLAujozh/"
                    className="text-blue-500 underline"
                  >
                    โพสต์ Instagram ของโรงเรียน
                  </a>
                </span>
                <ul className="list-disc pl-4 pt-4 leading-8 max-w-2xl">
                  <li>นักเรียนทุกคนต้องมีชุมนุมประจำ 1 ชุมนุม โดยเรียนตลอดปีการศึกษา 2564</li>
                  <li>กรุณาตรวจสอบกิจกรรมชุมนุมและขั้นตอนการลงทะเบียนจากหน้านี้ให้เรียบร้อย</li>
                  <li>
                    นักเรียนสามารถเลือกลงชุมนุมได้เพียง 1 ชุมนุมเท่านั้น
                    หากชุมนุมใดเต็มให้เลือกชุมนุมที่ว่างอยู่
                  </li>
                  <li>
                    ในการลงทะเบียนนักเรียนควรมีตัวเลือกในใจประมาณ 3 ชุมนุมเนื่องจากอาจลงไม่ทัน
                  </li>
                  <li>
                    หากนักเรียนคนใดไม่มีชุมนุมจะได้รับผลการเรียน "ไม่ผ่าน/มผ."
                    ซึ่งจะทำให้ไม่จบการศึกษา
                  </li>
                </ul>
              </div>
              <div className="p-4">
                <h2 className="text-xl creative-font font-bold flex-grow py-1">
                  กำหนดการลงทะเบียนชุมนุม ประจำปีการศึกษา 2564
                </h2>
                <span className="italic sarabun-font text-sm">
                  อ้างอิงจาก{' '}
                  <a
                    title="คำชี้แจงในการเลือกชุมนุม"
                    href="https://www.instagram.com/p/CQfRLAujozh"
                    className="text-blue-500 underline"
                  >
                    โพสต์ Instagram ของโรงเรียน
                  </a>
                </span>
                <ul className="list-disc pl-4 pt-4 leading-5 max-w-2xl">
                  <li>
                    <b>รอบที่ 1 วันที่ 25 มิถุนายน 2564 เวลา 12.00 - 13.00 น.</b>
                    <ol className="list-decimal pl-4 py-4 leading-7">
                      <li>
                        ชุมนุมที่รับสมัครนักเรียนเดิมต่อเนื่องเพราะนักเรียนต้องมีการพัฒนาทักษะอย่างสม่ำเสมอ
                        เช่น ชุมนุมวงโยธวาทิต ชุมนุมดนตรีไทย ชุมนุมนาฎศิลป์ไทย ชุมนุมสื่อสารมวลชน
                        เป็นต้น
                      </li>
                      <li>
                        ชุมนุมที่นักเรียนรวมกันก่อตั้ง เช่น ชุมนุม GAT for TCAS ชุมนุมนวนิยายที่รัก
                        เป็นต้น
                      </li>
                    </ol>
                  </li>
                  <li>
                    <b>รอบที่ 2 วันที่ 28 - 30 มิถุนายน 2564 เวลา 08.00 น. เป็นต้นไป</b>
                    <ol className="list-decimal pl-4 py-4 leading-7">
                      <li>ลงทะเบียนเพิ่มเติมจากรอบแรก</li>
                      <li>ลงทะเบียนในชุมนุมอื่นตามความถนัดและความสนใจ สอบถามรายละเอียดเพิ่มเต็ม</li>
                    </ol>
                  </li>
                </ul>
                <span className="italic sarabun-font text-sm py-1">
                  หากมีข้อสงสัยเพิ่มเติมกรุณาติดต่ออาจารย์กมณรัตน์ นทีสินทรัพย์
                </span>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="p-4">
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-0 gap-4 py-1">
                  <h2 className="text-xl creative-font font-bold flex-grow">
                    ขั้นตอนการลงทะเบียนผ่านเว็บไซต์
                  </h2>
                  <Tippy
                    visible={copy}
                    content="คัดลอกแล้ว"
                    placement="bottom"
                    onShown={() => setTimeout(() => setCopy(false), 3000)}
                  >
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('0000000000000')
                        setCopy(true)
                      }}
                      className="flex-shrink-0 px-4 py-2 text-sm text-white btn bg-apple-500 from-apple-500 to-apple-600 ring-apple-500"
                    >
                      {copy ? (
                        <ClipboardCheckIcon className="-mt-1 inline mr-2 h-5 w-5" />
                      ) : (
                        <DocumentDuplicateIcon className="-mt-1 inline mr-2 h-5 w-5" />
                      )}
                      คัดลอกเลข 0 13 ตัว
                    </button>
                  </Tippy>
                </div>
                <span className="italic sarabun-font text-sm">
                  อ้างอิงจาก{' '}
                  <a
                    title="วิธีการลงทะเบียนเลือกกิจกรรมชุมนุม"
                    href="https://www.instagram.com/p/CQacgSUD9OU/"
                    className="text-blue-500 underline"
                  >
                    โพสต์ Instagram ของคณะกรรมการกิจการนักเรียน
                  </a>
                </span>
                <ol className="list-decimal pl-4 py-4 leading-8">
                  <li>
                    เข้าสู่เว็บไซต์โดยคลิกที่ปุ่ม <b>เข้าสู่เว็บลงทะเบียน</b> ด้านบน
                  </li>
                  <li>
                    (แนะนำ) เลือกเมนู{' '}
                    <a
                      href="https://wpm.clubth.com/login.php"
                      title="เข้าระบบ"
                      target="_blank"
                      rel="noopener noreferer"
                      className="text-blue-500 underline font-normal"
                    >
                      เข้าระบบ
                    </a>{' '}
                    แล้วป้อนเลขประจำตัว 5 หลัก{' '}
                    <b className="text-red-500 font-normal">เลข 0 13 หลัก (คัดลอกได้จากหน้านี้)</b>{' '}
                    และป้อนรหัสยืนยันตัวตน (Captcha) ที่ปรากฏบนหน้าจอ
                    <br />
                    <span className="text-lg text-green-600 font-medium">
                      กรุณาคัดลอกเลขไว้เพื่อความสะดวกรวดเร็ว
                      เนื่องจากระบบจะไม่อนุญาตให้ดำเนินการต่อหากเลข 0 ไม่ครบ 13 ตัว
                    </span>
                  </li>
                  <li>
                    เลือกเมนู{' '}
                    <a
                      href="https://wpm.clubth.com/index.php?r=register_agreement"
                      target="_blank"
                      rel="noreferer noopener"
                      className="text-blue-500 underline font-normal"
                    >
                      ลงทะเบียนกิจกรรมชุมนุม
                    </a>{' '}
                    อ่านข้อตกลงให้เรียบร้อย เลือก <b>ยอมรับข้อตกลง</b> แล้วกด{' '}
                    <b>ลงทะเบียนกิจกรรม</b>
                  </li>
                  <li>
                    กรอกเลขประจำตัวนักเรียน 5 หลัก และ{' '}
                    <b className="text-red-500 font-normal">เลข 0 13 หลัก (คัดลอกได้จากหน้านี้)</b>{' '}
                    พร้อมทั้งรหัส Captcha อีกครั้ง
                  </li>
                  <li>
                    ยืนยันตัวตนด้วยเลขประจำตัวประชาชน 13 หลักของนักเรียน แล้วเลือก{' '}
                    <b>ดำเนินการขั้นตอนต่อไป</b>
                  </li>
                  <li>
                    เลือกชุมนุมที่ต้องการ{' '}
                    <b className="text-red-500 font-medium underline">
                      หากชุมนุมใดเต็มให้เลือกชุมนุมที่ว่างอยู่
                    </b>
                  </li>
                  <li>
                    เมื่อลงทะเบียนสำเร็จเรียบร้อยแล้ว ให้ถ่ายรูปหรือบันทึกภาพหน้าจอไว้เป็นหลักฐาน
                    แต่
                    <b>ไม่จำเป็นต้องพิมพ์ใบออกมา</b> เนื่องจากอาจารย์จะตรวจสอบข้อมูลผ่านระบบออนไลน์
                  </li>
                </ol>
              </div>
              <div className="px-4">
                <h2 className="text-xl creative-font font-bold">
                  การเชื่อมต่อและเรียนผ่านระบบของ PM-RianArai
                </h2>
                <p className="py-2 max-w-3xl">
                  เมื่อได้รับประกาศการเรียนชุมนุมผ่านระบบออนไลน์อย่างเป็นทางการ ทางเว็บไซต์
                  PM-RianArai จะเปิดให้สามารถตั้งค่าชุมนุมที่ลงทะเบียนไว้
                  และเมื่อถึงเวลาเรียนระบบจะแสดงห้อง Zoom ของอาจารย์ผู้รับผิดชอบชุมนุมโดยอัตโนมัติ
                </p>
                <b className="text-red-500 font-medium py-2">
                  อย่างไรก็ตาม ให้ติดตามข้อมูลจากทางโรงเรียนอย่างใกล้ชิด
                </b>
              </div>
            </TabPanel>
          </Tabs>
          <ModalComponent
            closable={true}
            onClose={() => setDetail(null)}
            show={detail !== null}
            title="รายละเอียดชุมนุม"
            size="max-w-lg"
            titleClass="bg-blue-500 text-white bg-opacity-80 creative-font font-bold"
          >
            <div className="p-4 h-72 flex flex-col gap-2 dark:bg-gray-700 dark:text-gray-100 overflow-y-auto">
              {detail && (
                <>
                  <div className="flex flex-row">
                    <div className="flex flex-col flex-grow space-y-2">
                      <h1 className="text-2xl sarabun-font font-bold">{detail.name}</h1>
                      <span className="font-medium text-lg text-blue-500">
                        ระดับชั้น: {generateClass(detail.target)}
                      </span>
                    </div>
                    <div className="flex flex-col flex-shrink-0 items-end text-sm font-light">
                      ลงทะเบียนแล้ว
                      <b className="text-2xl text-gray-600 dark:text-gray-300 font-medium">
                        <span
                          className={
                            detail.current === detail.all ? 'text-red-500' : 'text-green-500'
                          }
                        >
                          {detail.current}
                        </span>
                        /{detail.all}
                      </b>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 font-light">
                    <span>สถานที่เรียน: {detail.room}</span>
                    <span className="dark:text-gray-400 text-gray-600">
                      โดย {detail.teacher.join(', ')}
                    </span>
                  </div>

                  <h2 className="font-medium text-lg">วัตถุประสงค์ของชุมนุม</h2>
                  <div className="font-light">
                    {detail.description ? (
                      <MarkDownComponent search="" content={detail.description} />
                    ) : (
                      'กำลังโหลด...'
                    )}
                  </div>
                </>
              )}
            </div>
          </ModalComponent>
        </div>
      </LayoutComponent>
    </div>
  )
}
