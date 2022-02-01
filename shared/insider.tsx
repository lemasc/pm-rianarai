import dynamic from 'next/dynamic'

import dayjs from 'dayjs'
import { createContext, useContext, useEffect, useState } from 'react'
import { ReactNode } from 'react-markdown'

export const isDeprecated = () => dayjs().isAfter('2022-02-01')

const EXPECTED_SET_VALUE = () => (isDeprecated() ? TARGET_DOCS() : 'true')

export const TARGET_DOCS = () => (isDeprecated() ? 'v2_deprecated' : 'v3_insider')

export interface IInsiderContext {
  load: boolean
  show: boolean
  set: () => void
  clear: () => void
  shouldShow: () => boolean
}

const insiderContext = createContext<IInsiderContext | undefined>(undefined)

export const useInsider = (): IInsiderContext => {
  const ctx = useContext(insiderContext)
  if (!ctx) throw new Error('useInsider: Provider not found.')
  return ctx
}

function useProvideInsider(): IInsiderContext {
  const [load, setLoad] = useState(false)
  const [show, setShow] = useState(false)
  const shouldShow = () => localStorage.getItem('insider_notice') !== EXPECTED_SET_VALUE()
  useEffect(() => {
    if (shouldShow()) {
      setShow(true)
    }
  }, [setShow])

  useEffect(() => {
    if (show && !load) setLoad(true)
  }, [load, show])

  const set = () => {
    localStorage.setItem('insider_notice', EXPECTED_SET_VALUE())
    setShow(false)
  }
  const clear = () => {
    localStorage.removeItem('insider_notice')
    setShow(true)
  }

  return { load, show, shouldShow, set, clear }
}

export function InsiderProvider({ children }: { children: ReactNode }): JSX.Element {
  const insider = useProvideInsider()
  return <insiderContext.Provider value={insider}>{children}</insiderContext.Provider>
}
