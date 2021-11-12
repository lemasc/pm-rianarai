import { Teacher } from '@/shared-types/classroom'
import { useTeachers } from '@/shared/api'
import { useAuth } from '@/shared/authContext'
import { ComponentProps, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

export default function TeacherImage({
  teacher,
  alt,
  className,
  ...rest
}: { teacher?: Teacher } & Exclude<ComponentProps<'img'>, 'src'>) {
  const { endpoint } = useAuth()
  const [error, setError] = useState(false)
  const skeleton = teacher === undefined
  return (
    <>
      {(error || skeleton) && (
        <div className={`${error ? 'bg-gray-200' : ''} rounded-full ${className}`}>
          {skeleton && <Skeleton width={rest.width} height={rest.height} circle={true} />}
        </div>
      )}
      {!error && (
        <img
          draggable={false}
          alt={alt}
          onLoad={() => setError(false)}
          onError={() => setError(true)}
          src={teacher ? `${endpoint}/images/teachers/${teacher.id}` : undefined}
          {...rest}
          className={`${skeleton ? 'hidden' : ''} bg-gray-100 rounded-full ${className}`}
        />
      )}
    </>
  )
}
