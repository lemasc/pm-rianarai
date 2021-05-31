import Head from 'next/head'
import HeaderComponent from '../components/header'
export default function OfflinePage(): JSX.Element {
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>PM-Rianarai</title>
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent />
        <div className="flex-col flex justify-center items-center">
          <h2 className="p-2 font-bold creative-font">คุณกำลัง Offline</h2>
          <span className="p-4 font-light">
            กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของอุปกรณ์แล้วลองใหม่อีกครั้ง
          </span>
          <button
            onClick={() => window.location.reload()}
            className="btn px-4 py-2 from-blue-500 to-blue-600 bg-blue-500 text-white ring-blue-500"
          >
            โหลดใหม่
          </button>
        </div>
      </main>
    </div>
  )
}
