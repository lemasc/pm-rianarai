interface HeaderProps {
  className?: string
}

export default function HeaderComponent({ className }: HeaderProps): JSX.Element {
  return (
    <header
      className={'pt-14 pb-4 w-full font-light text-sm flex flex-col items-center ' + className}
    >
      <h1 className="sm:text-4xl text-3xl font-bold creative-font">เรียนอะไร?</h1>
      <span className="p-4 text-center sarabun-font">คุณไม่รู้ เราก็ไม่รู้เหมือนกัน</span>
    </header>
  )
}
