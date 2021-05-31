/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable react/display-name */
import Head from 'next/head'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import { Components } from 'react-markdown/src/ast-to-react'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import HeaderComponent from '../components/header'
/**
 * Single Page Application!
 */

export const getStaticProps: GetStaticProps = async (context) => {
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
  console.log(router.query)
  const components: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="sm:text-4xl text-2xl creative-font font-bold py-4" {...props} />
    ),
    h2: ({ node, ...props }) => {
      const match =
        typeof router.query.search == 'string' &&
        (node.children[0].value as string).split(' ')[0].includes(router.query.search)
      return (
        <h2
          id={match ? 'jump' : undefined}
          className={
            'sm:text-2xl text-lg creative-font font-medium py-4' + (match ? ' underline' : '')
          }
          {...props}
        />
      )
    },
    h3: ({ node, ...props }) => <h3 className="kanit-font text-lg font-medium py-4" {...props} />,
    a: ({ node, ...props }) => (
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
        {...props}
      />
    ),
    p: ({ node, ...props }) => <p className="py-2" {...props} />,
    li: ({ node, ordered, ...props }) => <li className="py-1 list-disc ml-8 px-2" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
    table: ({ node, ...props }) => (
      <table className="my-2 w-full table-auto border border-gray-200" {...props} />
    ),
    thead: ({ node, ...props }) => (
      <thead className="border dark:bg-black bg-gray-100" {...props} />
    ),
    th: ({ node, isHeader, ...props }) => <th className="border py-2" {...props} />,
    td: ({ node, isHeader, ...props }) => <td className="border py-2 px-2 md:px-4" {...props} />,
  }
  return (
    <div className="circle min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <Head>
        <title>About : PM-Rianarai</title>
      </Head>

      <main className="flex flex-1 flex-col w-full items-center justify-center">
        <HeaderComponent className="border-b" />
        <div className="md:mx-24 mx-8 font-thin p-4 sarabun-font break-words">
          <ReactMarkdown components={components} remarkPlugins={[gfm]}>
            {content}
          </ReactMarkdown>
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
