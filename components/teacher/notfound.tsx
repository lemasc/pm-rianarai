import { Teacher } from '@/shared-types/classroom'
import { useCourses } from '@/shared/api'

export default function TeacherNotFound({ teacher }: { teacher: Teacher }) {
  const { data: courses } = useCourses()

  return (
    <>
      <h3 className="font-medium text-red-500">เชื่อมต่อบัญชี Google กับข้อมูลครูผู้สอน</h3>
      <div className="font-light">
        กรุณาแจ้งในกลุ่ม Insider เพื่อดำเนินการเพิ่มข้อมูลลงในระบบ
        โดยคัดลอก/ถ่ายภาพหน้าจอข้อมูลดังต่อไปนี้
      </div>
      <div className="flex gap-2 sarabun-font">
        <b>Google User ID:</b>
        <span>{teacher.id}</span>
      </div>
      <b className="sarabun-font">ห้องเรียนที่สอน:</b>
      <div className="content sarabun-font">
        <ul>
          {courses
            ?.filter((c) => c.ownerId === teacher.id)
            .map((c) => (
              <li key={c.id}>
                {c.name} {(c.section ?? c.description) && `- ${c.section ?? c.description}`} ({c.id}
                )
              </li>
            ))
            .toList()
            .toArray()}
        </ul>
      </div>
    </>
  )
}
