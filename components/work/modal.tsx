/* eslint-disable react/display-name */

import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useForm, Controller } from 'react-hook-form'
import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import dayjs from 'dayjs'
import th from 'dayjs/locale/th'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(LocalizedFormat)
dayjs.locale(th)

import { db } from '@/shared/firebase'
import { useAuth } from '@/shared/authContext'
import { ClassroomCourseWorkResult } from '@/types/classroom'
import { DueDate, TagButton, toggleState, checkTurnedIn, minifiedFields } from './item'
import ModalComponent from '@/components/modal'
const CKEditor = dynamic(() => import('@/components/CKEditor'), {
  ssr: false,
  loading: () => (
    <i className="flex flex-col w-full" style={{ height: '150px' }}>
      กำลังโหลดโปรแกรมแก้ไข...
    </i>
  ),
})
const MarkDownComponent = dynamic(() => import('@/components/markdown'))
const DatePicker = dynamic(() => import('@/components/Datepicker').then((d) => d.DatePicker))

export type WorkModalState = {
  show: boolean
  index?: number
}

type ModalProps = {
  state: WorkModalState
  onClose: () => void
  data: ClassroomCourseWorkResult[]
}
type FormData = {
  title: string
  dueDate: Date
  hour?: number
  minutes?: number
  description: string
}

type ViewerProps = {
  item: ClassroomCourseWorkResult
  onEdit: () => void
  onClose: () => void
}
function WorkViewer({ item, onEdit, onClose }: ViewerProps): JSX.Element {
  const { user } = useAuth()
  async function onDelete(): Promise<void> {
    if (
      item &&
      item.custom &&
      confirm('ต้องการลบงานนี้หรือไม่? หากลบแล้วจะไม่สามารถกู้คืนได้อีก')
    ) {
      try {
        onClose()
        await deleteDoc(doc(db, `users/${user.uid}/classwork`, item.id))
      } catch (err) {
        console.error(err)
      }
    }
  }
  return (
    <>
      <div className="flex flex-row justify-center items-center">
        <div className="flex flex-col flex-grow space-y-2">
          <h1 className="text-2xl sarabun-font font-bold">{item.title}</h1>
        </div>
        <TagButton data={item} isModal={true} />
      </div>
      <div className="flex flex-col space-y-1 font-light">
        <span>
          <DueDate dueDate={item.dueDate} />
        </span>
        {item.course && (
          <span>
            <b>รายวิชา: </b>
            {item.course.name}
          </span>
        )}
        <span>
          <b>แหล่งข้อมูล: </b>
          {item.custom ? 'เพิ่มในระบบด้วยตนเอง' : 'Google Classroom (อัตโนมัติ)'}
        </span>
      </div>
      {item.custom ? (
        <>
          <div className="grid text-center my-2">
            <button
              type="button"
              title={`${
                checkTurnedIn(item.state) ? 'ยกเลิกการ' : ''
              }ทำเครื่องหมายงานนี้ว่าเสร็จสิ้น`}
              onClick={() => {
                toggleState(item, user.uid)
                onClose()
              }}
              className={`btn px-4 py-2 ${
                checkTurnedIn(item.state)
                  ? 'bg-yellow-300 text-gray-800'
                  : 'bg-apple-500 text-white'
              } ring-transparent`}
            >
              ทำเครื่องหมายว่าเสร็จสิ้น{checkTurnedIn(item.state) && 'แล้ว'}{' '}
            </button>
          </div>
          <div className=" items-center justify-center flex flex-col sm:grid-cols-2 sm:grid gap-4 w-full">
            <button
              title="แก้ไขงานนี้"
              type="button"
              onClick={() => onEdit()}
              className="w-full hover:text-white btn py-2 ring-indigo-500 border-opacity-80 border-indigo-500 border-2 from-indigo-600 to-indigo-600 hover:border-transparent"
            >
              แก้ไข
            </button>
            <button
              title="ลบงานนี้"
              type="button"
              onClick={() => onDelete()}
              className="w-full ring-red-500 btn py-2 border-2 border-red-500 border-opacity-80 from-red-500 to-red-600 hover:text-white hover:border-transparent"
            >
              ลบงานนี้
            </button>
          </div>
        </>
      ) : (
        <div className="grid text-center my-2">
          <a
            href={`https://classroom.google.com/c/${item.course.slug}/a/${item.slug}/details`}
            target="_blank"
            rel="noreferrer noopener"
            className="btn px-4 py-2 text-white bg-apple-500 from-apple-500 to-apple-600 ring-apple-500"
          >
            ไปยัง Google Classroom
          </a>
        </div>
      )}
      {item.description && (
        <>
          <h2 className="font-medium text-lg">รายละเอียดของงาน</h2>
          <div className="font-light dark:bg-gray-900 bg-gray-200 rounded py-2 px-4 text-sm sarabun-font">
            <MarkDownComponent search="" content={item.description} />
          </div>
        </>
      )}
    </>
  )
}
export default function WorkModal({ onClose, state, data }: ModalProps): JSX.Element {
  const { user, classroom } = useAuth()
  const [edit, setEdit] = useState(false)
  const { handleSubmit, register, control, reset } = useForm<FormData>({
    defaultValues: {
      title: '',
      dueDate: new Date(),
      hour: 23,
      minutes: 59,
      description: '',
    },
  })

  const item = data && data[state.index]
  useEffect(() => {
    if (!state.show) {
      reset({
        title: '',
        dueDate: new Date(),
        hour: 23,
        minutes: 59,
        description: '',
      })
      setEdit(false)
    }
  }, [state, reset])

  function _onClose(): void {
    if (edit) return setEdit(false)
    else onClose()
  }
  function setEditPage(): void {
    if (item && item.custom) {
      reset({
        ...item,
        dueDate: dayjs.unix(item.dueDate).toDate(),
      })
      setEdit(true)
    }
  }
  async function onSubmit(data): Promise<void> {
    try {
      const _data: ClassroomCourseWorkResult = {
        ...minifiedFields(data, classroom),
        dueDate: dayjs(data.dueDate).hour(data.hour).minute(data.minutes).unix(),
        custom: true,
        state: data.state ? data.state : 'CREATED',
        type: 'ASSIGNMENT',
      }
      setDoc(doc(db, `users/${user.uid}/classwork`, item ? item.id : nanoid()), _data)
      _onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <ModalComponent
      closable={true}
      onClose={onClose}
      show={state.show && data && data.length > 0}
      title={
        state.index !== undefined && !edit ? 'รายละเอียดของงาน' : `${edit ? 'แก้ไข' : 'เพิ่ม'}งาน`
      }
      size="max-w-lg"
      titleClass="bg-blue-500 text-white bg-opacity-80 creative-font font-bold"
    >
      <div className="p-4 flex flex-col gap-2 dark:bg-gray-700 dark:text-gray-100 overflow-y-auto">
        {item && !edit ? (
          <WorkViewer item={item} onEdit={setEditPage} onClose={onClose} />
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 justify-center">
              <div
                className="flex flex-col sm:grid items-center gap-4"
                style={{ gridTemplateColumns: 'max-content 1fr' }}
              >
                <label htmlFor="title">ชื่อ:</label>
                <input
                  className="input rounded-md w-full"
                  type="text"
                  {...register('title', {
                    required: {
                      value: true,
                      message: 'กรุณากรอกชื่องาน',
                    },
                  })}
                />

                <label htmlFor="dueDate" className="sm:mr-8">
                  วันที่กำหนดส่ง:{' '}
                </label>
                <Controller
                  control={control}
                  name="dueDate"
                  rules={{ required: true }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <DatePicker
                      onChange={onChange}
                      onBlur={onBlur}
                      config={{ date: value, minDate: dayjs('2021-05-31').toDate() }}
                    />
                  )}
                />
                <label htmlFor="hour">เวลากำหนดส่ง:</label>
                <div className="flex items-center">
                  <input
                    className="input rounded-md w-full text-center"
                    type="number"
                    {...register('hour', {
                      min: 0,
                      max: 23,
                      valueAsNumber: true,
                    })}
                  />
                  <span className="p-4">:</span>
                  <input
                    className="input rounded-md w-full text-center"
                    type="number"
                    {...register('minutes', {
                      min: 0,
                      max: 59,
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label htmlFor="description">รายละเอียด:</label>
                <div className="sarabun-font">
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CKEditor
                        data={value}
                        minified={true}
                        onReady={(editor) => {
                          if (!editor) return
                          editor.editing.view.change((writer) => {
                            writer.setStyle(
                              'height',
                              '150px',
                              editor.editing.view.document.getRoot()
                            )
                            writer.setStyle('width', '100%', editor.editing.view.document.getRoot())
                          })
                        }}
                        onChange={(event, editor) => {
                          onChange(editor.getData())
                        }}
                        onBlur={onBlur}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-grow items-center justify-center">
                <div className="items-center justify-center flex flex-col sm:grid-cols-2 sm:grid gap-4 w-full">
                  <button
                    type="submit"
                    className="w-full text-white btn py-2 ring-apple-500 bg-apple-500 from-apple-500 to-apple-600 disabled:bg-gray-200 disabled:text-gray-500 disabled:from-gray-200 disabled:to-gray-200 disabled:cursor-not-allowed"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => _onClose()}
                    type="button"
                    className="w-full btn py-2 ring-gray-300 text-black bg-gray-300 from-gray-300 to-gray-400"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </ModalComponent>
  )
}
