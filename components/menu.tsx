import { Announcement, useAuth } from '../shared/authContext'
import { CogIcon, LogoutIcon, ClockIcon, SpeakerphoneIcon } from '@heroicons/react/outline'
import { Document } from 'swr-firestore-v9'

export type Pages = 'settings' | 'timetable' | 'announce' | null

type MenuComponentProps = {
  onChange: (page: Pages) => void
  page: Pages
}

export default function MenuComponent({ onChange, page }: MenuComponentProps): JSX.Element {
  const { announce, metadata, signOut, remove } = useAuth()
  function iconClasses(target?: Pages): string {
    const targetCheck = target !== undefined ? target === page : false
    return (
      'sm:w-10 sm:h-10 w-8 h-8 font-light ' +
      (targetCheck ? 'opacity-100' : 'opacity-60 hover:opacity-100')
    )
  }
  function setPage(target: Pages): void {
    if (page == target) onChange(null)
    else onChange(target)
  }
  function getUnreadAnnounce(): Document<Announcement>[] {
    return Object.values(announce.filter((a) => !(metadata && metadata.announceId?.includes(a.id))))
  }
  return (
    <div className="flex flex-row absolute top-0 right-0 p-4 sm:p-6 space-x-4">
      <button
        title="ประกาศ"
        className="relative focus:outline-none"
        onClick={() => setPage('announce')}
      >
        <SpeakerphoneIcon className={iconClasses('announce')} strokeWidth={1} />
        {announce && metadata && getUnreadAnnounce().length > 0 && (
          <span className="absolute rounded-full bg-red-500 bg-opacity-75 hover:bg-opacity-100 px-2 text-sm text-white -top-1 -right-2">
            {getUnreadAnnounce().length}
          </span>
        )}
      </button>
      {metadata && (
        <>
          <button
            title="ตารางเวลา"
            className="focus:outline-none"
            onClick={() => setPage('timetable')}
          >
            <ClockIcon className={iconClasses('timetable')} strokeWidth={1} />
          </button>
          <button
            title="การตั้งค่า"
            className="focus:outline-none"
            onClick={() => setPage('settings')}
          >
            <CogIcon className={iconClasses('settings')} strokeWidth={1} />
          </button>
          <button
            title="ออกจากระบบ"
            className="focus:outline-none"
            onClick={() => {
              setPage(null)
              if (metadata) return signOut()
              remove().then((ok) => {
                if (!ok) signOut()
              })
            }}
          >
            <LogoutIcon className={iconClasses()} strokeWidth={1} />
          </button>
        </>
      )}
    </div>
  )
}
