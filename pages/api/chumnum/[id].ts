/**
 * Chumnum Display API v1
 *
 * This api will fetch and format data from the original server
 * and return as a compatible-JSON format for external applications.
 */

import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { JSDOM } from 'jsdom'
import { ChumnumData, ChumnumResult } from '@/types/chumnum'

export default async (req: NextApiRequest, res: NextApiResponse<ChumnumResult>): Promise<void> => {
  if (req.method !== 'GET' || !req.query.id) return res.status(400).json({ success: false })
  try {
    const html = await axios.get(
      'https://wpm.clubth.com/index.php?r=club_available&ac=view&sterm=1&syear=2564',
      { responseType: 'text' }
    )
    const dom = new JSDOM(html.data.replace(/\t/g, '').replace(/ {2}/g, ' '))
    const doc = (dom.window as unknown as Window).document
    const tbody = doc.querySelector('tbody')
    const row = tbody.rows.item(parseInt(req.query.id as string) - 1)
    if (!row) return res.status(400).json({ success: false })
    const cells = row.cells
    const info = cells
      .item(1)
      .textContent.replace('สถานที่เรียน', '')
      .replace('หมายเหตุ', '')
      .replace('\n', '')
      .trim()
      .split(' : ')
    const teacher = []
    const rawTeacher = cells.item(2).textContent.replace('\n', '')
    const listNo = rawTeacher.match(/[0-9]./g)
    for (let i = 0; i < listNo.length; i++) {
      teacher.push(
        rawTeacher.slice(
          rawTeacher.indexOf(listNo[i]) + 2,
          listNo[i + 1] ? rawTeacher.indexOf(listNo[i + 1]) : undefined
        )
      )
    }
    const target: Set<number> = new Set()
    for (let i = 3; i < cells.length - 2; i++) {
      if (!cells.item(i).textContent) target.add(i - 2)
    }
    const id = parseInt(cells.item(0).textContent)
    const result: ChumnumData[] = [
      {
        id,
        teacher,
        name: info[0],
        room: info[1],
        //notice: info[2],
        target: Array.from(target),
        current: parseInt(cells.item(cells.length - 1).textContent),
        all: parseInt(cells.item(cells.length - 2).textContent),
        description: doc.querySelector('#ModalShowDetail' + id + ' .modal-body').textContent.trim(),
      },
    ]
    return res.status(200).json({ success: true, result })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false })
  }
}
