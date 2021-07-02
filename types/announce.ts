export type DocsData = {
  success: boolean
  content?: string
}

export type AnnounceData = {
  id: string
  name: string
  new: boolean
  content: undefined | string
  success?: boolean
}

export type Announcement = {
  created_at: Date
  enable: boolean
  displayName: string
  name: string
  needs_login: boolean
  target: string
}