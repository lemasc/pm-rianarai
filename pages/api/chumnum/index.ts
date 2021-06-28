/**
 * Chumnum Display API v1
 *
 * This api will fetch and format data from the original server
 * and return as a compatible-JSON format for external applications.
 */

import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { JSDOM } from 'jsdom'
import admin from '../../../shared/firebase-admin'

export type ChumnumStatus = 'online' | 'intime'

export type ChumnumData = {
  id: number
  name: string
  teacher?: string[]
  room?: string
  current: number
  all: number
  target?: number[]
  description?: string
}

export type ChumnumResult = {
  success: boolean
  status?: ChumnumStatus | string
  result?: ChumnumData[]
}

export default async (req: NextApiRequest, res: NextApiResponse<ChumnumResult>): Promise<void> => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') return res.status(400).json({ success: false })
  try {
    const html = await axios.get(
      'https://wpm.clubth.com/index.php?r=club_available&ac=view&sterm=1&syear=2564',
      { responseType: 'text' }
    )
    const dom = new JSDOM(html.data.replace(/\t/g, '').replace(/ {2}/g, ' '))
    const doc = (dom.window as unknown as Window).document
    const tbody = doc.querySelector('tbody')
    const db = admin.firestore()
    const result: ChumnumData[] = []
    for (let i = 0; i < tbody.rows.length; i++) {
      const row = tbody.rows.item(i)
      const cells = row.cells
      const info = cells
        .item(1)
        .textContent.replace('สถานที่เรียน', '')
        .replace('หมายเหตุ', '')
        .replace('\n', '')
        .trim()
        .split(' : ')
      /*const teacher = []
      const rawTeacher = cells.item(2).textContent.replace('\n', '')
      const listNo = rawTeacher.match(/[0-9]./g)
      for (let i = 0; i < listNo.length; i++) {
        teacher.push(
          rawTeacher
            .slice(
              rawTeacher.indexOf(listNo[i]) + 2,
              listNo[i + 1] ? rawTeacher.indexOf(listNo[i + 1]) : undefined
            )
            .trim()
        )
      }
      const target: Set<number> = new Set()
      for (let i = 3; i < cells.length - 2; i++) {
        if (!cells.item(i).textContent) target.add(i - 2)
      }*/
      const id = parseInt(cells.item(0).textContent)
      const data = {
        id,
        name: info[0],
        current: parseInt(cells.item(cells.length - 1).textContent),
        all: parseInt(cells.item(cells.length - 2).textContent),
        /*
        teacher,
        room: info[1],
        notice: info[2],
        target: Array.from(target),
        description: doc.querySelector('#ModalShowDetail' + id + ' .modal-body').textContent.trim(),
        */
      }
      result.push(data)
    }
    await Promise.all(
      result.map(async (r) => {
        await db.collection('chumnum').doc(r.id.toString()).update(r)
      })
    )

    let status: ChumnumStatus = 'online'
    if (doc.querySelector('.info label').textContent.split(' : ')[1] === 'เปิดให้ลงทะเบียน') {
      status = 'intime'
    }
    return res.status(200).json({ success: true, status })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false })
  }
}
