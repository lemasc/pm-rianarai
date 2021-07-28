import { classroom_v1, google } from 'googleapis'
import type { NextApiResponse } from 'next'
import { withSession, NextApiSessionRequest, createOAuth2, withRefreshToken } from '@/shared/api'
import { ClassroomCredentials } from '../callback'
import { APIResponse, ClassroomCourseResult } from '@/types/classroom'

const listCourses = async (
  req: NextApiSessionRequest,
  res: NextApiResponse<APIResponse>
): Promise<void> => {
  try {
    const oAuth2Client = createOAuth2(req)
    const tokens: ClassroomCredentials[] = req.session.get('token')
    if (!tokens) return res.status(400).json({ success: false })
    const courses = await Promise.all(
      tokens.map(async (t): Promise<ClassroomCourseResult[]> => {
        oAuth2Client.setCredentials({
          access_token: t.access_token,
          refresh_token: t.refresh_token,
        })
        const api = await withRefreshToken<classroom_v1.Schema$ListCoursesResponse>(
          oAuth2Client,
          req,
          async (client) => {
            return await google.classroom('v1').courses.list({
              auth: client,
            })
          },
          t.id
        )
        return api.result.data.courses
          .filter((c) => c.courseState === 'ACTIVE')
          .map((c) => ({
            id: c.id,
            name: c.name,
            section: c.section,
            slug: c.alternateLink.replace('https://classroom.google.com/c/', ''),
          }))
      })
    )
    await req.session.save()
    res.status(200).json({ success: true, data: courses })
  } catch (err) {
    console.error(err)
    res.status(200).json({ success: false })
  }
}

export default withSession(listCourses)
