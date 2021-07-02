import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'

type PaginationProps = {
  index: number
  onChange: (id: number) => void
  name: string
  showIcons: boolean
  length: number
  className: string
}

export default function Pagination({
  index,
  onChange,
  name,
  showIcons,
  length,
  className,
}: PaginationProps): JSX.Element {
  return (
    <div className="flex flex-row justify-center py-2 px-4">
      <div className="w-4 h-4 pt-1">
        {showIcons && (
          <ChevronLeftIcon
            className={index == 0 ? 'cursor-not-allowed opacity-25' : 'cursor-pointer'}
            onClick={() => index !== 0 && onChange(index - 1)}
          />
        )}
      </div>
      <div className={'flex px-4 justify-center ' + className}>{name}</div>
      <div className="w-4 h-4 pt-1">
        {showIcons && (
          <ChevronRightIcon
            className={index + 1 == length ? 'cursor-not-allowed opacity-25' : 'cursor-pointer'}
            onClick={() => index + 1 !== length && onChange(index + 1)}
          />
        )}
      </div>
    </div>
  )
}
