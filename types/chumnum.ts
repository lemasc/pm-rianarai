export type ChumnumStatus = 'online' | 'intime'

export type ChumnumData = {
  id: number
  name: string
  teacher?: string[]
  room?: string
  current: number
  all: number
  target?: number[]
  description?: string
}

export type ChumnumResult = {
  success: boolean
  status?: ChumnumStatus | string
  result?: ChumnumData[]
}