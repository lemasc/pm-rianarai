import { createContext, useEffect, useState } from 'react'

type ViewState = 'date' | 'month' | 'year'

export interface DatepickerConfig {
  date: Date
  minDate?: Date
  maxDate?: Date
}
interface MonthYear {
  month: number
  year: number
}
interface DateValidator {
  day?: number
  month?: number
  year: number
}

interface DatepickerContextType {
  date: Date | null
  visible: MonthYear
  view: ViewState
  nextMonth: () => void
  prevMonth: () => void
  nextYear: () => void
  prevYear: () => void
  nextDecade: () => void
  prevDecade: () => void
  selectMonth: (m: number) => void
  selectYear: (y: number) => void
  selectDate: (d: number) => void
  viewMonths: () => void
  viewYears: () => void
  isVisible: boolean
  showCalendar: () => void
  toggleCalendar: () => void
  isSelected: (d: number) => boolean
  isValid: (d: DateValidator) => boolean
}

export const DatepickerCtx = createContext<DatepickerContextType | undefined>(undefined)

export function useDatepickerCtx(
  config: DatepickerConfig,
  onChange: (d: Date) => void,
  ref: HTMLElement
): DatepickerContextType {
  const { date, minDate, maxDate } = config
  const [monthYear, setMonthYear] = useState<MonthYear>({
    month: date?.getMonth() ?? new Date().getMonth(),
    year: date?.getFullYear() ?? new Date().getFullYear(),
  })

  const [view, setView] = useState<ViewState>('date')

  const [isVisible, setVisible] = useState<boolean>(false)

  const selectDate = (d: number): void => {
    onChange(new Date(monthYear.year, monthYear.month, d))
    setVisible(false)
  }

  const isSelected = (d: number): boolean => {
    let dateCheck = d === date.getDate(),
      monthCheck = monthYear.month === date.getMonth(),
      yearCheck = monthYear.year === date.getFullYear()

    // Silently pass on some views.
    if (view != 'date') {
      dateCheck = true
      monthCheck = d === date.getMonth()
    }
    if (view == 'year') {
      monthCheck = true
      yearCheck = d === date.getFullYear()
    }
    return dateCheck && monthCheck && yearCheck
  }
  const isValid = (d: DateValidator): boolean => {
    if (d.month == undefined) {
      d.month = 12
    }
    if (!d.day) {
      d.day = daysInMonth(d.month, d.year)
    }
    const _date = new Date()
    _date.setFullYear(d.year)
    _date.setMonth(d.month)
    _date.setDate(d.day)
    if (view != 'date') {
      _date.setMonth(d.month - 1)
    }
    // For year view there will be a special thing to do
    if (view == 'year') {
      if (minDate && minDate.getFullYear() > d.year) return false
      if (maxDate && maxDate.getFullYear() < d.year) return false
      return true
    } else {
      _date.setDate(d.day - 1)
    }
    // Other views proceed as normal.
    if (maxDate && _date > maxDate) {
      return false
    }
    if (minDate && _date < minDate) {
      return false
    }
    return true
  }

  const selectMonth = (m: number): void => {
    setMonthYear((state) => ({ ...state, month: m }))
    setView('date')
  }

  const selectYear = (y: number): void => {
    setMonthYear((state) => ({ ...state, year: y }))
    setView('month')
  }

  useEffect(() => {
    function mouseDownListener(e: MouseEvent): void {
      const target = e.target as Element
      // Button Target will cause an unknown bug, don't catch it anyway.
      if (isVisible && target.nodeName != 'BUTTON' && !target.closest('.datepicker')) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', mouseDownListener)
    return () => document.removeEventListener('mousedown', mouseDownListener)
  }, [ref, isVisible])

  useEffect(() => {
    if (isVisible) {
      setView('date')
      setMonthYear({ month: date.getMonth(), year: date.getFullYear() })
    }
  }, [isVisible, date])

  return {
    date,
    visible: monthYear,
    view,
    nextMonth: () =>
      setMonthYear((state) =>
        state.month >= 11
          ? { month: 0, year: state.year + 1 }
          : { month: state.month + 1, year: state.year }
      ),
    prevMonth: () =>
      setMonthYear((state) =>
        state.month <= 0
          ? { month: 11, year: state.year - 1 }
          : { month: state.month - 1, year: state.year }
      ),
    nextYear: () => setMonthYear((state) => ({ ...state, year: state.year + 1 })),
    prevYear: () => setMonthYear((state) => ({ ...state, year: state.year - 1 })),
    nextDecade: () => setMonthYear((state) => ({ ...state, year: state.year + 12 })),
    prevDecade: () => setMonthYear((state) => ({ ...state, year: state.year - 12 })),
    selectMonth,
    selectYear,
    selectDate,
    viewMonths: () => setView('month'),
    viewYears: () => setView('year'),
    isVisible,
    showCalendar: () => setVisible(true),
    toggleCalendar: () => setVisible(!isVisible),
    isSelected,
    isValid,
  }
}

/**
 * Days in month
 */
export function daysInMonth(month: number, year: number): number {
  switch (month) {
    case 0:
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 11:
      return 31
    case 1:
      return isLeapYear(year) ? 29 : 28
    default:
      return 30
  }
}

/**
 * Is Leap Year
 * @param year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}
