export interface TimeSlots {
  start: string
  end: string
  teacher: string[]
  code: string[]
}

export interface Meeting {
  code?: string
  meeting: string
  name: string
  subject: string
  url?: string
  meet?: boolean
}
