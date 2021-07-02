import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import HeaderComponent from '@/components/layout/header'
import MarkDownComponent from '@/components/markdown'

export const getStaticProps: GetStaticProps = async () => {
  // Fetch data from Github Docs
  const res = await fetch('https://raw.githubusercontent.com/lemasc/pm-rianarai/main/docs/about.md')
  const content = await res.text()
  return {
    props: {
      content,
    },
  }
}

export default function MainPage({
  content,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  const router = useRouter()
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>About : PM-RianArai</title>
        <meta property="og:url" content="https://pm-rianarai.vercel.app/about" />
        <meta property="og:title" content="เกี่ยวกับ PM-RianArai" />
        <meta property="og:description" content="เข้าเรียนทุกวิชาได้จากทีนี่ที่เดียว" />
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent className="border-b" />
        <div className="md:mx-24 mx-8 font-thin p-4 sarabun-font break-words">
          <MarkDownComponent content={content} search={router.query.search} />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 dark:text-white flex justify-center items-center w-full p-8 border-t">
        <Link href="/">
          <a className="text-sm underline">กลับไปยังหน้าหลัก</a>
        </Link>
      </footer>
    </div>
  )
}
