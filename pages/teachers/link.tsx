import Title from '@/components/layout/title'
import TeacherEditor from '@/components/teacher/editor'
import { useTeachers } from '@/shared/api'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

function LinkTeacherPage(): JSX.Element {
  const { query, replace } = useRouter()
  const { data: teachers } = useTeachers()
  const userId = query?.userId as string
  useEffect(() => {
    if (!userId) replace('/teachers')
  }, [userId, replace])
  return (
    <>
      <Title>
        <h2>เชื่อมต่อบัญชี Google กับครูผู้สอน</h2>
      </Title>
      {teachers && (
        <TeacherEditor userId={userId} data={teachers?.get(userId)} onSubmit={console.log} />
      )}
    </>
  )
}

export default LinkTeacherPage
