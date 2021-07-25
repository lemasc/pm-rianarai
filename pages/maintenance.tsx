import Head from 'next/head'
import HeaderComponent from '@/components/layout/header'
export default function MaintenancePage() {
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>PM-RianArai</title>
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent />
        <div className="p-4 text-center flex-col flex items-center justify-center gap-4">
          <h2 className="text-xl font-bold sarabun-font">ปิดปรับปรุงเว็บไซต์ชั่วคราว</h2>
          <p className="p-4 sarabun-font max-w-3xl">
            เนื่องจากในสัปดาห์นี้ทางโรงเรียนได้ประกาศงดการเรียนการสอน
            และเพื่อพัฒนาประสิทธิภาพการใช้งานให้ดียิ่งขึ้น ทาง PM-RianArai
            จึงขอปิดปรับปรุงเว็บไซต์ชั่วคราวในวันที่ 27 - 31 กรกฎาคม 2564
            หลังจากนั้นจะสามารถเข้าใช้งานได้ตามปกติ
          </p>
          <span className="text-gray-500 font-light">
            สามาถติดตามข้อมูลข่าวสารและอัพเดทต่าง ๆ ได้ที่{' '}
            <a
              href="https://twitter.com/lemascth"
              className="text-blue-500 hover:text-blue-600 underline text-bold font-normal"
              target="_blank"
              rel="noreferrer noopener"
            >
              Twitter Official Account
            </a>{' '}
          </span>
        </div>
      </main>
    </div>
  )
}
