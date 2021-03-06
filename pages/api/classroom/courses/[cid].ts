import dayjs from 'dayjs'
import { classroom_v1, google } from 'googleapis'
import type { NextApiResponse } from 'next'
import { withSession, NextApiSessionRequest, createOAuth2, withRefreshToken } from '@/shared/api'
import { ClassroomCredentials } from '../callback'
import { APIResponse, ClassroomCourseWorkResult, WorkState, WorkType } from '@/types/classroom'

/*
function getMaterials(
  materials: classroom_v1.Schema$Material[]
): (keyof classroom_v1.Schema$Material)[] {
  if (!materials) return undefined
  console.log(materials)
  return materials
    .filter((material) => Object.values(material).length !== 0)
    .map((material) =>
      Object.fromEntries(
        Object.entries(material).map(([key, value]) => [
          key,
          value[key].alternateLink | value[key].formUrl | value[key].url,
        ])
      )
    ) as unknown as (keyof classroom_v1.Schema$Material)[]
}
*/

function generateDuedate(
  date: classroom_v1.Schema$Date,
  time: classroom_v1.Schema$TimeOfDay
): number | undefined {
  if (!date) return undefined
  let instance = dayjs(Object.values(date).join('/'))
  if (time.hours && time.minutes) {
    instance = instance
      .hour(process.env.NODE_ENV === 'production' ? time.hours : time.hours + 7)
      .minute(time.minutes)
  } else {
    instance = instance.hour(23).minute(59)
  }
  return instance.unix()
}

const listWorks = async (
  req: NextApiSessionRequest,
  res: NextApiResponse<APIResponse<ClassroomCourseWorkResult[]>>
): Promise<void> => {
  if (!req.query.cid || !req.query.account) return res.status(400).json({ success: false })

  try {
    const oAuth2Client = createOAuth2(req)
    const tokens: ClassroomCredentials[] = req.session.get('token')
    if (!tokens) return res.status(400).json({ success: false })
    const token = tokens[parseInt(req.query.account as string)]
    oAuth2Client.setCredentials({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    })
    const api = await withRefreshToken<classroom_v1.Schema$ListCourseWorkResponse>(
      oAuth2Client,
      req,
      async (client) => {
        return await google.classroom('v1').courses.courseWork.list({
          courseId: req.query.cid as string,
          auth: client,
        })
      },
      token.id
    )
    if (!api.result.data.courseWork) {
      return res.status(200).json({
        success: true,
        data: [],
      })
    }
    const workApi = await withRefreshToken<classroom_v1.Schema$ListStudentSubmissionsResponse>(
      oAuth2Client,
      req,
      async (client) => {
        return await google.classroom('v1').courses.courseWork.studentSubmissions.list({
          courseId: req.query.cid as string,
          courseWorkId: '-',
          auth: client,
        })
      }
    )
    const work: ClassroomCourseWorkResult[] = api.result.data.courseWork
      .map((w) => {
        const id = workApi.result.data.studentSubmissions.findIndex((s) => s.courseWorkId === w.id)
        if (id === -1) return null
        return {
          id: w.id,
          title: w.title,
          type: w.workType as WorkType,
          slug: w.alternateLink.split('/')[6],
          description: w.description,
          //materials: getMaterials(w.materials),
          dueDate: generateDuedate(w.dueDate, w.dueTime),
          state: workApi.result.data.studentSubmissions[id].state as WorkState,
        }
      })
      .filter((w) => w !== null)

    await req.session.save()
    res.setHeader('Cache-Control', `private, max-age=${60 * 60}`)
    res.status(200).json({
      success: true,
      data: work,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}

export default withSession(listWorks)
