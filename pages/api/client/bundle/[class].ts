import { NextApiSessionRequest, withAuth } from '@/shared/api'
import admin from '@/shared/firebase-admin'
import { Schedule } from '@/shared/meetingContext'
import dayjs from 'dayjs'
import { NextApiResponse } from 'next'

// Chunk function from https://stackoverflow.com/a/60779547
function chunk<Type>(array: Type[], size: number): Type[] {
  return array.reduce((acc, _, i: number) => {
    if (i % size === 0) acc.push(array.slice(i, i + size))
    return acc
  }, [])
}

const bundleCreator = async (req: NextApiSessionRequest, res: NextApiResponse) => {
  const classParams = req.query.class as string
  if (!classParams || classParams.length !== 3 || isNaN(parseInt(classParams)))
    return res.status(403).end()
  const db = admin.firestore()
  try {
    const classes = await db.collection('classes').doc(classParams).get()
    const teachers = new Set(
      Object.values(classes.data() as Schedule)
        .map((slot) =>
          Object.values(slot)
            .map((time) => time.teacher)
            .flat()
        )
        .flat()
    )

    // Firestore limits 'IN' query up to 10 comparison values.
    // Split into chunks instead.
    const bundle = db.bundle(`classes-${classParams}`).add(classes)
    const chunks = chunk(Array.from(teachers), 10)
    const bundleName = req.query.version === '2' ? `teachers-${classParams}` : `teachers`
    await Promise.all(
      chunks.map(async (t, i) => {
        bundle.add(
          `${bundleName}-${i}`,
          await db.collection('meetings').where('name', 'in', Array.from(t)).get()
        )
      })
    )
    const maxAge = dayjs.unix(req.token.exp)
    res.setHeader('Expires', maxAge.toString())
    res.setHeader(
      'Cache-Control',
      `private, max-age=${maxAge.diff(dayjs(), 'seconds')}, stale-while-revalidate=${maxAge
        .add(10, 'minutes')
        .diff(dayjs(), 'seconds')}`
    )
    res.end(bundle.build())
  } catch (err) {
    console.error(err)
    res.status(500).end()
  }
}

export default withAuth(bundleCreator, true)
