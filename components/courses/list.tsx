import { getName, useCourses, useTeachers } from '@/shared/api'

import Card from '@/components/card'
import { ComponentProps } from 'react'
import { Course, Teacher } from '@/shared-types/classroom'
import TeacherImage from '../teacher/image'

type CourseCardProps = {
  teacher: Teacher
  course: Course
  desc: string
} & Omit<ComponentProps<typeof Card>, 'className' | 'children'>

function CourseCard({ teacher, title, desc, course, ...rest }: CourseCardProps) {
  const name = course.name
  return (
    <Card {...rest} title={name} className="flex flex-col w-full lg:w-card">
      <div className="flex flex-row p-4 gap-6 bg-jaffa-500 relative rounded-t-lg">
        <div className="absolute -bottom-1/3 right-4">
          <TeacherImage
            alt={name}
            teacher={teacher}
            width={60}
            height={60}
            className="h-14 w-14 sm:h-16 sm:w-16"
          />
        </div>
        <div className="flex-col sarabun-font flex gap-2 text-white truncate text-sm">
          <div className="flex flex-col gap-1 hover:underline" style={{ minHeight: '3rem' }}>
            <h2 className="text-lg font-bold truncate">{name}</h2>
            <span className="text-xs">{desc}</span>
          </div>
          <div>
            {course && course.alternateLink && (
              <img
                alt="Classroom"
                title="ข้อมูลจาก Google Classroom"
                className="-mt-1 mr-2 inline"
                src="/classroom.svg"
                width={20}
                height={20}
              />
            )}
            {getName(teacher)}
          </div>
        </div>
      </div>
      <div className="border-t p-6 h-52"></div>
    </Card>
  )
}
export default function CourseList() {
  const { data: courses } = useCourses()
  const { data: teachers } = useTeachers()
  return (
    <>
      <span className="font-light">แสดงผลข้อมูลรายวิชา {courses ? courses.size : 0} รายการ</span>
      <div className="flex flex-row flex-wrap gap-6">
        {courses &&
          courses
            .toList()
            .sortBy((c) => c.name)
            .map((c) => (
              <CourseCard
                teacher={teachers?.get(c.ownerId)}
                course={c}
                title={c.name}
                desc={c.section ?? c.description}
                key={c.id}
                href={`/courses/${c.id}`}
              />
            ))}
      </div>
    </>
  )
}
