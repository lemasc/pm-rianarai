import { useWindowWidth } from '@react-hook/window-size'
import { useState } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth, UserMetadata } from '../shared/authContext'

interface MetaProps {
  onSubmit?: () => void
  minUI?: boolean
}

export default function MetadataComponent({ onSubmit, minUI }: MetaProps): JSX.Element {
  const width = useWindowWidth()
  const { updateMeta, metadata, remove, signOut } = useAuth()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserMetadata>()
  const watchClass = watch('class')
  const formSubmit = async (data): Promise<void> => {
    const meta = Object.assign({}, data) as UserMetadata
    meta.class = meta.class + '0' + meta.room
    delete meta.room
    try {
      await updateMeta(meta)
      onSubmit && onSubmit()
    } catch (err) {
      alert('ไม่สามารถอัปเดตข้อมูลได้')
    }
  }
  const cancel = async (): Promise<void> => {
    console.log(metadata)
    if (metadata) {
      setValue('class', metadata.class.toString().slice(0, 1))
      setValue('room', metadata.class.toString().slice(2))
      setValue('displayName', metadata.displayName)
    } else {
      reset()
      if (!(await remove())) {
        await signOut()
      }
    }
  }
  useEffect(() => {
    if (!metadata) return
    setValue('class', metadata.class.toString().slice(0, 1))
    setValue('room', metadata.class.toString().slice(2))
    setValue('displayName', metadata.displayName)
  }, [metadata, setValue])
  function isMinUI() {
    return minUI && width > 798 && width < 1210
  }
  return (
    <>
      <form
        className={
          'flex flex-col px-8 pb-2 gap-2' +
          (isMinUI() ? ' items-center' : ' sm:grid sm:grid-cols-2 gap-x-4')
        }
        onSubmit={handleSubmit(formSubmit)}
      >
        <label htmlFor="class" className="py-1 sm:py-2 sm:text-left">
          ห้องเรียน :
        </label>
        <div className="flex flex-row gap-2 items-center justify-center">
          <input
            name="class"
            className="input text-center w-20"
            type="number"
            inputMode="numeric"
            {...register('class', { required: true, min: 1, max: 6 })}
          />
          <span className="p-2 flex-grow text-center">/</span>
          <input
            name="room"
            className="input text-center w-20"
            type="number"
            inputMode="numeric"
            {...register('room', {
              required: true,
              min: 1,
              validate: (value) => {
                if (watchClass >= 1 && watchClass <= 3) return value <= 4
                return value <= 3
              },
            })}
          />
        </div>
        <div
          className={(isMinUI() ? '' : 'sm:text-left') + ' py-1 sm:py-2 flex flex-col align-middle'}
        >
          <label htmlFor="name">อยากให้เราเรียกคุณว่าอะไร? </label>
          <span className="text-gray-400 text-xs py-2">ใส่อิโมจิหรือภาษาอื่น ๆ ลงก็ได้นะ</span>
        </div>
        <textarea
          name="displayName"
          className="input text-center sm:text-left text-sm"
          {...register('displayName', { required: true })}
        />
        {!isMinUI() ? (
          <>
            <button
              type="submit"
              className="sm:mt-4 mt-2 text-white btn py-2 ring-apple-500 bg-apple-500 from-apple-500 to-apple-600"
            >
              {metadata ? 'บันทึก' : 'เสร็จสิ้น'}
            </button>
            <button
              type="button"
              onClick={() => cancel()}
              className="sm:mt-4 btn py-2 ring-gray-300 text-black bg-gray-300 from-gray-300 to-gray-400"
            >
              ยกเลิก
            </button>
          </>
        ) : (
          <div className="flex flex-col sm:grid-cols-2 sm:grid gap-4 w-full">
            <button
              type="submit"
              className="sm:mt-4 mt-2 text-white btn py-2 ring-apple-500 bg-apple-500 from-apple-500 to-apple-600"
            >
              {metadata ? 'บันทึก' : 'เสร็จสิ้น'}
            </button>
            <button
              type="button"
              onClick={() => cancel()}
              className="sm:mt-4 btn py-2 ring-gray-300 text-black bg-gray-300 from-gray-300 to-gray-400"
            >
              ยกเลิก
            </button>
          </div>
        )}
      </form>
      {Object.keys(errors).length != 0 && (
        <span className="font-bold text-sm text-red-500">กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง</span>
      )}
    </>
  )
}
