import { useMeeting } from '@/shared/meetingContext'
import { Meeting, TimeSlots } from '@/types/meeting'
import { ReactNodeArray, useEffect, useState } from 'react'
import { MeetingNotFound, MeetingJoin } from './status'

interface MeetingInfoProps {
  slot: TimeSlots
  disabled: boolean
}

export function GenerateTeacherName(teacher: string[]): ReactNodeArray {
  function getPrefix(t: string): string {
    if (t.match(/^[a-zA-Z0-9]*$/g)) return 'T.'
    if (t.indexOf('.') === -1) return 'อ.'
    return ''
  }
  return teacher.map((t, i) => (
    <span key={i}>
      {i !== 0 && ' | '}
      {getPrefix(t)}
      {t}
    </span>
  ))
}
export function MeetingPending({ slot }: { slot: TimeSlots }): JSX.Element {
  if (!slot) return null
  return (
    <>
      {slot.code.join(' , ')} ({GenerateTeacherName(slot.teacher)}) : {slot.start} น.
    </>
  )
}

export function MeetingInfo({ slot, disabled }: MeetingInfoProps): JSX.Element {
  const [meeting, setMeeting] = useState<Meeting[]>([])
  const { ready, meeting: _meeting } = useMeeting()
  useEffect(() => {
    if (!_meeting || !slot) return
    setMeeting(_meeting.filter((m) => slot.teacher.includes(m.name)))
  }, [_meeting, slot])
  if (!ready || !slot) return null
  return (
    <div className="flex flex-col md:grid md:grid-cols-2 w-full md:divide-x divide-gray-400 text-center">
      <div className="flex flex-col justify-center items-center">
        <div className="text-2xl p-4 text-blue-600 font-medium px-8 max-w-md">
          {meeting.length > 0 &&
            slot.code[0].match(/([0-9]){4}\w/g) !== null &&
            meeting[0].subject + ' : '}
          {slot.code.length > 1 && <br />}
          {slot.code.join(' , ')}
        </div>
        {slot.teacher.length > 0 && (
          <span className="px-4 text-blue-600">สอนโดย {GenerateTeacherName(slot.teacher)}</span>
        )}
        <span className="font-light p-2">
          {slot.start} น. - {slot.end} น.
        </span>
      </div>
      <div className="flex flex-col justify-center items-center">
        {meeting.length === 0 || meeting[0].meet ? (
          <MeetingNotFound />
        ) : (
          <MeetingJoin meetings={meeting} showNames={meeting.length != 1} disabled={disabled} />
        )}
      </div>
    </div>
  )
}
