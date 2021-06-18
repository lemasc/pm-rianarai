import { Announcement, useAuth, UserMetadata } from '../shared/authContext'
import { LogoutIcon, SpeakerphoneIcon } from '@heroicons/react/outline'
import { Document } from 'swr-firestore-v9'

export type Pages = 'settings' | 'timetable' | 'announce' | null

type MenuComponentProps = {
  onAnnounce: () => void
  landing?: boolean
}

export function getUnreadAnnounce(
  announce: Document<Announcement>[],
  metadata: UserMetadata
): Document<Announcement>[] {
  if (!announce) return []
  return Object.values(announce.filter((a) => !(metadata && metadata.announceId?.includes(a.id))))
}

export default function MenuComponent({ onAnnounce, landing }: MenuComponentProps): JSX.Element {
  const { announce, metadata, signOut, remove } = useAuth()

  return (
    <div
      className={
        'flex flex-row absolute top-0 right-0 p-6 space-x-4 ' +
        (landing ? 'text-white' : 'text-gray-800')
      }
    >
      <button title="ประกาศ" className="relative focus:outline-none" onClick={() => onAnnounce()}>
        <SpeakerphoneIcon
          className="w-8 h-8 font-light opacity-60 hover:opacity-100"
          strokeWidth={1}
        />
        {announce && metadata && getUnreadAnnounce(announce, metadata).length > 0 && (
          <span className="absolute rounded-full bg-red-500 bg-opacity-75 hover:bg-opacity-100 px-2 text-sm text-white -top-1 -right-2">
            {getUnreadAnnounce(announce, metadata).length}
          </span>
        )}
      </button>
      {metadata && (
        <>
          <button
            title="ออกจากระบบ"
            className="focus:outline-none"
            onClick={() => {
              if (metadata) return signOut()
              remove().then((ok) => {
                if (!ok) signOut()
              })
            }}
          >
            <LogoutIcon
              className="w-8 h-8 font-light opacity-60 hover:opacity-100"
              strokeWidth={1}
            />
          </button>
        </>
      )}
    </div>
  )
}
