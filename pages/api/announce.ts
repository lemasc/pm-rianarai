import type { NextApiRequest, NextApiResponse } from 'next'
import type { DocsData } from '@/types/announce'

export default async (req: NextApiRequest, res: NextApiResponse<DocsData>): Promise<void> => {
  if (req.method !== 'GET' || !req.query.name) return res.status(400).json({ success: false })
  try {
    const data = await fetch(
      'https://raw.githubusercontent.com/lemasc/pm-rianarai/main/docs/announcement/' +
        req.query.name +
        '.md'
    )
    const content = await data.text()
    if (content == '404: Not Found') return res.status(404).json({ success: false })
    return res.status(200).json({ success: true, content })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false })
  }
}
