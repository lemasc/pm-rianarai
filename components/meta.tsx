import { useForm } from 'react-hook-form'
import { useAuth, UserMetadata } from '../shared/authContext'

export default function MetadataComponent(): JSX.Element {
  const auth = useAuth()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserMetadata>()
  const watchClass = watch('class')
  const onSubmit = async (data): Promise<void> => {
    const meta = Object.assign({}, data) as UserMetadata
    meta.class = meta.class + '0' + meta.room
    delete meta.room
    try {
      await auth.updateMeta(meta)
    } catch (err) {
      alert('ไม่สามารถอัปเดตข้อมูลได้')
    }
  }
  console.log(errors)
  return (
    <>
      <form
        className="flex flex-col px-8 pb-2 gap-2 gap-x-4 sm:grid sm:grid-cols-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label htmlFor="id" className="p-1 sm:p-2 sm:text-left">
          รหัสประจำตัวนักเรียน :
        </label>
        <input
          name="id"
          className="input text-center sm:text-left"
          type="number"
          inputMode="numeric"
          {...register('id', { required: true, maxLength: 5, minLength: 5 })}
        />
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
        <label htmlFor="name" className="p-1 sm:p-2 sm:text-left">
          อยากให้เราเรียกคุณว่าอะไร :
        </label>
        <input
          name="displayName"
          className="input text-center sm:text-left"
          type="string"
          {...register('displayName', { required: true })}
        />
        <button
          type="submit"
          className="sm:mt-4 mt-2 text-white btn ring-apple-500 bg-apple-500 from-apple-500 to-apple-600"
        >
          เรียบร้อย !
        </button>
        <button
          type="reset"
          onClick={async () => await auth.remove()}
          className="sm:mt-4 btn ring-gray-300 text-black bg-gray-300 from-gray-300 to-gray-400"
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
