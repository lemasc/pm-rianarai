import type { NextApiRequest, NextApiResponse } from 'next'
import pdf from 'pdf-parse'
import path from 'path'
import { promises as fs } from 'fs'

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const dataBuffer = await fs.readFile(path.join(process.cwd(), 'file.pdf'))
  const data = await pdf(dataBuffer)
  return res.status(200).json(data)
}
