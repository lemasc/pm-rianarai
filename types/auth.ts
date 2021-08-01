export type Provider = 'facebook.com' | 'google.com' | 'password'

export interface UserMetadata {
  upgrade?: 'v2' | 'v2.2'
  class: number | string
  room?: number | string
  name: string
  displayName: string
  email: string
  provider: Provider[]
  announceId?: string[]
  insider?: boolean
  insiderAt?: Date | any
}
