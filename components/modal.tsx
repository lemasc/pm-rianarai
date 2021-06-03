import { Fragment, MutableRefObject, ReactNode } from 'react'
import { Transition, Dialog } from '@headlessui/react'

type ModalComponentProps = {
  show: boolean
  onClose: () => void
  children: ReactNode
  title: string
  initialFocus: MutableRefObject<HTMLButtonElement>
  titleClass?: string
  description?: string
  descriptionClass?: string
}

export default function ModalComponent({
  show,
  children,
  initialFocus,
  onClose,
  title,
  titleClass,
  description,
  descriptionClass,
}: ModalComponentProps): JSX.Element {
  return (
    <Transition show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
        initialFocus={initialFocus}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className={'text-lg leading-6 ' + titleClass}>
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className={descriptionClass}>{description}</Dialog.Description>
              )}
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
