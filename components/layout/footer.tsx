import { shouldLoadPage } from '@/shared/index'
import { useAuth } from '@/shared/authContext'
import { useRouter } from 'next/router'

export default function FooterComponent(): JSX.Element {
  const { version } = useAuth()
  const router = useRouter()
  return (
    <footer
      className={`text-center bottom-0 bg-white bg-opacity-30 text-black text-sm gap-3 ${
        router.pathname == '/' ? `border-t p-8` : 'bg-gray-100 border-t py-6'
      } flex flex-col justify-center items-center w-full `}
    >
      <div className="flex flex-row justify-center text-center items-center w-full space-x-4">
        <a href="/about" target="_blank" rel="noopener" className="font-normal underline">
          เกี่ยวกับเรา
        </a>
        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          className="font-normal underline"
        >
          แจ้งปัญหาการใช้งาน / ติดต่อ
        </a>
      </div>

      {shouldLoadPage ? (
        <span className="text-gray-800">Version {version.slice(1)}</span>
      ) : (
        <span className="text-gray-500 font-light flex flex-row flex-wrap gap-1 justify-center">
          <span>สามารถติดตามข้อมูลข่าวสารและอัพเดทต่าง ๆ ได้ที่</span>
          <a
            href="https://twitter.com/lemascth"
            className="text-blue-500 hover:text-blue-600 underline text-bold font-normal"
            target="_blank"
            rel="noreferrer noopener"
          >
            Twitter Official Account
          </a>{' '}
        </span>
      )}
    </footer>
  )
}
