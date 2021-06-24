/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable react/display-name */

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import { Components } from 'react-markdown/src/ast-to-react'

export default function MarkDownComponent({
  content,
  search = '',
}: {
  content: string
  search: string | string[]
}): JSX.Element {
  const components: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="sm:text-4xl text-2xl creative-font font-bold py-4" {...props} />
    ),
    h2: ({ node, ...props }) => {
      const match =
        typeof search == 'string' &&
        (node.children[0].value as string).split(' ')[0].includes(search)
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
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="kanit-font py-2 my-2 pl-6 border-l-4 border-gray-500 bg-gray-100 dark:bg-gray-900"
        {...props}
      />
    ),
    ul: ({ node, depth, ordered, ...props }) => <ol className="list-disc ml-8 px-2" {...props} />,
    ol: ({ node, depth, ordered, ...props }) => (
      <ol className="list-decimal ml-8 px-2" {...props} />
    ),
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
    <ReactMarkdown components={components} remarkPlugins={[gfm]}>
      {content}
    </ReactMarkdown>
  )
}
