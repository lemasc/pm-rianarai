import { useAuth } from '../shared/authContext'
import { CogIcon, LogoutIcon, ClockIcon } from '@heroicons/react/outline'

export type Pages = 'settings' | 'timetable' | null

type MenuComponentProps = {
  onChange: (page: Pages) => void
  page: Pages
}

export default function MenuComponent({ onChange, page }: MenuComponentProps): JSX.Element {
  const auth = useAuth()
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
  return (
    <div className="flex flex-row absolute top-0 right-0 p-4 sm:p-6 space-x-4">
      <button title="ตารางเวลา" className="focus:outline-none" onClick={() => setPage('timetable')}>
        <ClockIcon className={iconClasses('timetable')} strokeWidth={1} />
      </button>
      <button title="การตั้งค่า" className="focus:outline-none" onClick={() => setPage('settings')}>
        <CogIcon className={iconClasses('settings')} strokeWidth={1} />
      </button>
      <button
        title="ออกจากระบบ"
        className="focus:outline-none"
        onClick={() => {
          setPage(null)
          if (auth.metadata) return auth.signOut()
          auth.remove().then((ok) => {
            if (!ok) auth.signOut()
          })
        }}
      >
        <LogoutIcon className={iconClasses()} strokeWidth={1} />
      </button>
    </div>
  )
}
