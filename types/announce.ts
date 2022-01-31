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
  /**
   * This special tag was made because some devices is using outdated clients, and might not know about the new RianArai 3.0.
   *
   * Clients that updated to the latest version won't see this announcement, as it will be filtered out.
   */
  outdatedClient?: boolean
}
