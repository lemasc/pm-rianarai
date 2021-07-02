export type APIResponse<T = any> = {
  success: boolean
  data?: T
}

export type ClassroomSessionResult = {
  name: string
  email: string
  valid: boolean
}

export type ClassroomCourseResult = {
  accountId?: number
  id: string
  name: string
  section: string
  slug: string
}

export type WorkState = 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT'

export type ClassroomCourseWorkResult = {
  courseId?: string
  id: string
  title: string
  slug: string
  description: string
  //materials: (keyof classroom_v1.Schema$Material)[]
  dueDate: number
  state: WorkState
}
