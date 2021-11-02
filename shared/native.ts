/* eslint-disable @typescript-eslint/no-explicit-any */
import electron from 'electron'

const ipcRenderer = electron.ipcRenderer || false

export function emitEvent<T = any>(eventName: string, data?: T) {
  if (ipcRenderer) {
    ipcRenderer.send(eventName, data)
  }
}

export async function sendEventAsync<T = any>(eventName: string, data?: T): Promise<T> {
  if (ipcRenderer) {
    return await ipcRenderer.invoke(eventName, data)
  }
}

type Unsubscribe = () => void
export function createEventListener<T = any>(
  eventName: string,
  callback: (data?: T) => void
): Unsubscribe {
  if (ipcRenderer) {
    const subscription = (event, data) => callback(data)
    ipcRenderer.on(eventName, subscription)
    return () => {
      ipcRenderer.removeListener(eventName, subscription)
    }
  }
}
