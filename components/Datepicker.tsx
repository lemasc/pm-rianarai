import React, { LegacyRef, useContext, useState } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'
import { usePopper } from 'react-popper'
import { DatepickerCtx, useDatepickerCtx, DatepickerConfig, daysInMonth } from './DatepickerContext'
import dayjs from 'dayjs'
import th from 'dayjs/locale/th'
import localeData from 'dayjs/plugin/localeData'
dayjs.locale(th)
dayjs.extend(localeData)

interface DatePickerProps {
  config: DatepickerConfig
  onChange: (date: Date) => void
  onBlur?: () => void
}

export const DatePicker: React.FC<DatePickerProps> = ({ config, onChange, onBlur }) => (
  <RawDatePicker config={config} onChange={onChange} onBlur={onBlur}></RawDatePicker>
)

export const RawDatePicker: React.FC<DatePickerProps> = ({ config, onChange, onBlur }) => {
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const ctxValue = useDatepickerCtx(config, onChange, popperElement)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
  })
  return (
    <DatepickerCtx.Provider value={ctxValue}>
      <>
        <div className="flex w-full datepicker" ref={setReferenceElement}>
          <input
            className="focus:outline-none px-3 py-2 border border-gray-400 font-light hover:ring-0 focus:ring-0 rounded-l-md flex-grow"
            type="text"
            onBlur={() => onBlur && onBlur()}
            onFocus={() => ctxValue.showCalendar()}
            value={formattedDate(config.date)}
            readOnly
          />
          <button
            type="button"
            className="bg-gray-300 rounded-r flex items-center justify-center text-sm font-semibold text-gray-700 px-3 border border-gray-400 focus:outline-none"
            onClick={() => {
              ctxValue.toggleCalendar()
            }}
          >
            <CalendarIcon className="w-h h-5 text-gray-500" />
          </button>
        </div>
        {ctxValue.isVisible && (
          <Calendar style={styles.popper} {...attributes.popper} ref={setPopperElement} />
        )}
      </>
    </DatepickerCtx.Provider>
  )
}

interface CalendarProps {
  style: React.CSSProperties
  ref: React.Ref<HTMLDivElement>
}

const CalendarComponent = (props, ref: LegacyRef<HTMLDivElement>): JSX.Element => {
  const { view } = useContext(DatepickerCtx)
  let selectionComponent = null
  switch (view) {
    case 'date':
      selectionComponent = <DateSelection />
      break
    case 'month':
      selectionComponent = <MonthSelection />
      break
    case 'year':
      selectionComponent = <YearSelection />
      break
  }

  return (
    <div
      className="bg-white relative shadow-lg max-w-xs w-64 p-2 rounded-lg z-20 border sarabun-font"
      ref={ref}
      data-placement={props.placement}
      style={props.style}
    >
      {selectionComponent}
    </div>
  )
}

const Calendar: React.FC<CalendarProps> = React.forwardRef<HTMLDivElement, CalendarProps>(
  CalendarComponent
)

/**
 * Date Selection Component
 * @param props
 */
const DateSelection: React.FC = () => {
  const {
    nextMonth,
    prevMonth,
    viewMonths,
    viewYears,
    selectDate,
    visible: { month, year },
    isSelected,
    isValid,
  } = useContext(DatepickerCtx)
  const dates = []

  for (let i = 0; i < beginningDayOfWeek(month, year); i++) {
    dates.push(<div key={`emptybefore${i}`}></div>)
  }

  for (let i = 1; i <= daysInMonth(month, year); i++) {
    if (isValid({ day: i, month, year })) {
      dates.push(
        <button
          type="button"
          key={`day${i}`}
          className={`hover:bg-gray-200 rounded p-1 text-sm ${
            isSelected(i) ? 'bg-blue-400 hover:text-gray-800 text-white font-semibold' : ''
          }`}
          onClick={() => selectDate(i)}
          style={{ textAlign: 'center' }}
        >
          {i}
        </button>
      )
    } else {
      dates.push(
        <button
          type="button"
          key={`day${i}`}
          className={`hover:bg-gray-200 rounded p-1 text-sm text-gray-300 `}
          style={{ textAlign: 'center' }}
        >
          {i}
        </button>
      )
    }
  }

  return (
    <div
      className="text-gray-800"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
        gridTemplateRows: '2rem auto',
        alignItems: 'stretch',
      }}
    >
      <button type="button" className={buttonClassName} onClick={() => prevMonth()}>
        <ChevronLeftIcon className="w-5 h-5 stroke-current" />
      </button>

      <button
        type="button"
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: '2/5' }}
        onClick={() => viewMonths()}
      >
        {/*monthNames[month]*/}
        {dayjs.months()[month]}
      </button>

      <button
        type="button"
        className={`${buttonClassName} font-semibold`}
        style={{ gridColumn: '5/7' }}
        onClick={() => viewYears()}
      >
        {year}
      </button>

      <button type="button" className={buttonClassName} onClick={() => nextMonth()}>
        <ChevronRightIcon className="w-5 h-5 stroke-current" />
      </button>

      {dayjs.weekdaysMin().map((day) => (
        <div
          key={(200 + day).toString()}
          className="p-1 text-sm font-semibold"
          style={{ textAlign: 'center' }}
        >
          {day}
        </div>
      ))}

      {dates}
    </div>
  )
}

/**
 * Month Selection Component
 * @param props
 */
const MonthSelection: React.FC = () => {
  const { viewYears, selectMonth, nextYear, prevYear, visible, isValid, isSelected } =
    useContext(DatepickerCtx)

  return (
    <div
      className="h-48"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '2rem auto',
        alignItems: 'stretch',
      }}
    >
      <div className="flex border-b" style={{ gridColumn: '1/5' }}>
        <CalButton chevron="left" onClick={() => prevYear()} />
        <CalButton className="flex-grow font-semibold" onClick={() => viewYears()}>
          {visible.year}
        </CalButton>
        <CalButton chevron="right" onClick={() => nextYear()} />
      </div>
      {dayjs.months().map((month, index) => {
        if (isValid({ month: index, year: visible.year })) {
          return (
            <CalButton
              key={'monthValid' + index}
              className={
                isSelected(index) ? 'bg-blue-400 hover:text-gray-800 text-white font-semibold' : ''
              }
              onClick={() => selectMonth(index)}
            >
              {month.substring(0, 3)}
            </CalButton>
          )
        } else {
          return (
            <CalButton key={'month' + index} className="text-gray-300">
              {month.substring(0, 3)}
            </CalButton>
          )
        }
      })}
    </div>
  )
}

/**
 * Year Selection Component
 * @param props
 */
const YearSelection: React.FC = () => {
  const {
    selectYear,
    prevDecade,
    nextDecade,
    isSelected,
    isValid,
    visible: { year },
  } = useContext(DatepickerCtx)

  const years = []
  const [minYear, maxYear] = [year - 6, year + 6]

  for (let i = minYear; i < maxYear; i++) {
    if (isValid({ year: i })) {
      years.push(
        <CalButton
          key={'yearValid' + i}
          className={
            isSelected(i) ? 'bg-blue-400 hover:text-gray-800 text-white font-semibold' : ''
          }
          onClick={() => selectYear(i)}
        >
          {i}
        </CalButton>
      )
    } else {
      years.push(
        <CalButton className="text-gray-300" key={'year' + i}>
          {i}
        </CalButton>
      )
    }
  }

  return (
    <div
      className="h-48"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '2rem auto',
        alignItems: 'stretch',
      }}
    >
      <div className="flex border-b" style={{ gridColumn: '1/5' }}>
        <CalButton chevron="left" onClick={() => prevDecade()} />
        <CalButton className="flex-grow font-semibold">{`${minYear} - ${maxYear - 1}`}</CalButton>
        <CalButton chevron="right" onClick={() => nextDecade()} />
      </div>

      {years}
    </div>
  )
}

const buttonClassName =
  'hover:bg-gray-200 rounded p-1 text-sm flex align-center items-center justify-center focus:outline-none'

const CalButton: React.FC<{
  chevron?: 'right' | 'left'
  className?: string
  style?: React.StyleHTMLAttributes<HTMLButtonElement>
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}> = (props) => {
  let children = null

  if (props.chevron && props.chevron === 'left')
    children = <ChevronLeftIcon className="w-5 h-5 stroke-current" />
  else if (props.chevron && props.chevron === 'right')
    children = <ChevronRightIcon className="w-5 h-5 stroke-current" />
  else children = props.children

  return (
    <button
      type="button"
      className={`${buttonClassName} ${props.className}`}
      style={props.style}
      onClick={props.onClick}
    >
      {children}
    </button>
  )
}

/**
 * Util functions
 */
/**
 * For formatting date
 * @param date
 */
function formattedDate(date: Date): string {
  return `${date.getDate()} ${dayjs.months()[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Beginning of Day of Week of a Month
 * @param date
 */
function beginningDayOfWeek(m: number, y: number): number {
  return new Date(y, m, 1).getDay()
}
