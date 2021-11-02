import admin from '@/shared/firebase-admin'
import { Schedule } from '@/shared/meetingContext'
import { NextApiHandler } from 'next'

// Chunk function from https://stackoverflow.com/a/60779547
function chunk<Type>(array: Type[], size: number): Type[] {
  return array.reduce((acc, _, i: number) => {
    if (i % size === 0) acc.push(array.slice(i, i + size))
    return acc
  }, [])
}

const bundleCreator: NextApiHandler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Accept')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (
    !req.query.class ||
    req.query.class.length !== 3 ||
    isNaN(parseInt(req.query.class.toString()))
  )
    return res.status(403).end()

  if (req.method === 'OPTIONS') return res.status(200).end()
  const db = admin.firestore()
  try {
    const classes = await db.collection('classes').doc(req.query.class.toString()).get()
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
    const bundle = db.bundle(`classes-${req.query.class.toString()}`).add(classes)
    const chunks = chunk(Array.from(teachers), 10)
    await Promise.all(
      chunks.map(async (t, i) => {
        bundle.add(
          `teachers-${i}`,
          await db.collection('meetings').where('name', 'in', Array.from(t)).get()
        )
      })
    )
    res.setHeader('Cache-Control', `public, max-age=${60 * 10}`)
    res.end(bundle.build())
  } catch (err) {
    console.error(err)
    res.status(500).end()
  }
}

export default bundleCreator
