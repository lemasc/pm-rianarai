export type JWTData = {
  exp: number
  ip: string | string[]
  session: string | string[]
  uid: string
}

export type APIResult = {
  success: boolean
  message: string | JWTData
}
