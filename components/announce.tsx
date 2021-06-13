import { ArrowLeftIcon } from '@heroicons/react/outline'
import { useWindowWidth } from '@react-hook/window-size/throttled'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { DocsData } from '../pages/api/announce'
import { useAuth } from '../shared/authContext'
import MarkDownComponent from './markdown'
const ModalComponent = dynamic(() => import('./modal'))

type ComponentProps = {
  show: boolean
  onClose: () => void
}

type AnnounceData = {
  id: string
  name: string
  new: boolean
  content: undefined | string
  success?: boolean
}

export default function AnnouncementComponent({ show, onClose }: ComponentProps): JSX.Element {
  const { metadata, announce, markAsRead } = useAuth()
  const [data, setData] = useState<AnnounceData[]>([])
  const [index, setIndex] = useState(-1)
  const [list, showList] = useState(false)
  const width = useWindowWidth()
  useEffect(() => {
    if (!announce) return
    setData((data) =>
      Object.values(announce).map((a, i) => {
        const content = data[i] ? data[i].content : undefined
        const success = data[i] ? data[i].success : undefined
        console.log(metadata?.announceId, a.id)
        return {
          id: a.id,
          name: a.name,
          new: !(metadata && metadata.announceId?.includes(a.id)),
          content,
          success,
        }
      })
    )
  }, [metadata, announce])

  useEffect(() => {
    if (show) {
      setIndex(0)
      showList(false)
    }
  }, [show])

  useEffect(() => {
    ;(async () => {
      if (index === -1) return
      if (data[index].success !== undefined) return
      const cData = Object.assign([], data) as AnnounceData[]
      try {
        const api = await fetch(
          '/api/announce?' + new URLSearchParams({ name: cData[index].name }).toString()
        )
        const result = (await api.json()) as DocsData
        console.log(result)
        if (result.success && show && cData[index].new) {
          // Mark as readed
          await markAsRead(data[index].id)
        }
        cData[index].success = result.success
        cData[index].content = result.content
        setData(cData)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [data, index, markAsRead, show])

  return (
    <ModalComponent
      size="max-w-5xl"
      title="ประกาศ"
      show={show}
      onClose={onClose}
      titleClass="bg-apple-500 text-white bg-opacity-80 creative-font font-bold"
    >
      {}
      <div className="flex flex-row">
        <div
          className={
            'sm:w-64 w-full flex flex-col items-start bg-gray-50 sm:block ' +
            (!list ? 'hidden' : '')
          }
        >
          {width <= 640 && (
            <span className="px-6 py-3 text-sm font-light">เลือกประกาศที่ต้องการ</span>
          )}
          {announce &&
            announce.map((a, i) => (
              <button
                key={i}
                className={
                  (width > 640 && index === i ? 'bg-gray-200' : 'bg-gray-100') +
                  ' flex flex-row w-full px-6 py-3 hover:bg-gray-200 focus:outline-none text-left items-center'
                }
                onClick={() => {
                  setIndex(i)
                  showList(false)
                }}
              >
                <div className="flex flex-col flex-grow">
                  <h4 className="text-lg">{a.displayName}</h4>
                  <span className="sarabun-font text-sm text-gray-500">
                    ประกาศเมื่อ {a.created_at.toLocaleDateString('th-TH')}
                  </span>
                </div>
                {data[i] && data[i].new && (
                  <span className="rounded-full bg-red-500 bg-opacity-75 hover:bg-opacity-100 px-2.5 text-white">
                    !
                  </span>
                )}
              </button>
            ))}
        </div>
        <div
          className={
            'text-sm text-gray-700 px-6 py-3 w-60 flex-grow sarabun-font sm:block ' +
            (list ? 'hidden' : '')
          }
        >
          {width <= 640 && (
            <button
              onClick={() => showList(true)}
              className="flex flex-row focus:outline-none rounded px-4 py-2 bg-blue-500 text-white hober:bg-blue-600"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              ดูประกาศทั้งหมด ({announce && announce.length})
            </button>
          )}
          {data[index] && data[index].success !== undefined ? (
            <>
              {data[index].success === false ? (
                <h4 className="py-3 text-lg font-bold text-red-500">ไม่สามารถโหลดข้อมูลได้</h4>
              ) : (
                <>
                  <MarkDownComponent search="" content={data[index].content} />
                </>
              )}
            </>
          ) : (
            <h4 className="py-3 text-lg">กำลังโหลดข้อมูล</h4>
          )}
        </div>
      </div>
    </ModalComponent>
  )
}
