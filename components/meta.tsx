import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth, UserMetadata } from '../shared/authContext'

interface MetaProps {
  onSubmit?: () => void
}

export default function MetadataComponent({ onSubmit }: MetaProps): JSX.Element {
  const { updateMeta, metadata, remove, signOut } = useAuth()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
    if (metadata) onSubmit && onSubmit()
    else {
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
  return (
    <>
      <form
        className="flex flex-col px-8 pb-2 gap-2 gap-x-4 sm:grid sm:grid-cols-2"
        onSubmit={handleSubmit(formSubmit)}
      >
        <label htmlFor="class" className="p-1 sm:p-2 sm:text-left">
          ห้องเรียน :
        </label>
        <div className="flex flex-row gap-2">
          <input
            name="class"
            className="input text-center w-16"
            type="number"
            inputMode="numeric"
            {...register('class', { required: true, min: 1, max: 6 })}
          />
          <span className="p-2 flex-grow">/</span>
          <input
            name="room"
            className="input text-center w-16"
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
        <div className="p-1 sm:p-2 sm:text-left flex flex-col align-middle">
          <label htmlFor="name">อยากให้เราเรียกคุณว่าอะไร? </label>
          <span className="text-gray-400 text-xs py-2">ใส่อิโมจิหรือภาษาอื่น ๆ ลงก็ได้นะ</span>
        </div>
        <textarea
          name="displayName"
          className="input text-center sm:text-left text-sm"
          {...register('displayName', { required: true })}
        />
        <button
          type="submit"
          className="sm:mt-4 mt-2 text-white btn py-2 ring-apple-500 bg-apple-500 from-apple-500 to-apple-600"
        >
          เรียบร้อย !
        </button>
        <button
          type="reset"
          onClick={() => cancel()}
          className="sm:mt-4 btn py-2 ring-gray-300 text-black bg-gray-300 from-gray-300 to-gray-400"
        >
          ยกเลิก
        </button>
      </form>
      {Object.keys(errors).length != 0 ? (
        <span className="font-bold text-sm text-red-500">กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง</span>
      ) : (
        <span className="font-light text-sm">ระบบรวบรวมข้อมูลที่จำเป็นเท่านั้น</span>
      )}
    </>
  )
}
