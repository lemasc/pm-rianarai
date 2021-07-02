import { ClassroomCourseResult, ClassroomCourseWorkResult } from '@/types/classroom'
import Dexie from 'dexie'

export class RianAraiDatabase extends Dexie {
  courseWork: Dexie.Table<ClassroomCourseWorkResult, string>
  courses: Dexie.Table<ClassroomCourseResult, string>

  constructor() {
    super('rianArai')

    //
    // Define tables and indexes
    // (Here's where the implicit table props are dynamically created)
    //
    this.version(1).stores({
      courseWork: 'id, courseId, title, type, state, dueDate',
      courses: 'id, name, section, accountId',
    })

    // The following lines are needed for it to work across typescipt using babel-preset-typescript:
    this.courseWork = this.table('courseWork')
    this.courses = this.table('courses')
  }
}
export const db = new RianAraiDatabase()
