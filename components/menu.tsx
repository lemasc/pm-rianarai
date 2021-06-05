import { useAuth } from '../shared/authContext'
import { CogIcon, LogoutIcon } from '@heroicons/react/outline'

type MenuComponentProps = {
  onChange: (boolean) => void
}

export default function MenuComponent({ onChange }: MenuComponentProps): JSX.Element {
  const auth = useAuth()
  return (
    <div className="flex flex-row absolute top-0 right-0 p-4 sm:p-6 space-x-4">
      <button title="การตั้งค่า" className="focus:outline-none" onClick={() => onChange(true)}>
        <CogIcon
          className="sm:w-10 sm:h-10 w-8 h-8 font-light opacity-60 hover:opacity-100"
          strokeWidth={1}
        />
      </button>
      <button
        title="ออกจากระบบ"
        className="focus:outline-none"
        onClick={() => {
          onChange(false)
          if (auth.metadata) return auth.signout()
          auth.remove().then((ok) => {
            if (!ok) auth.signout()
          })
        }}
      >
        <LogoutIcon
          className="sm:w-10 sm:h-10 w-8 h-8 font-light opacity-60 hover:opacity-100"
          strokeWidth={1}
        />
      </button>
    </div>
  )
}
