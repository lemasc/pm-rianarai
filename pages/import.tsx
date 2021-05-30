import React, { useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry'
import { db } from '../shared/firebase'
export default function MainPage(): JSX.Element {
  /*const [pdf, setPdf] = useState(null)
  const changeHandler = (event) => {
    console.log('handle')
    console.log(event.target.files[0])
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
    const fileReader = new FileReader()
    fileReader.onload = async () => {
      console.log('ONLO')
      const arrayB = new Uint8Array(fileReader.result as ArrayBuffer)
      pdfjsLib.getDocument(arrayB).promise.then((pdf) => setPdf(pdf))
    }
    fileReader.readAsArrayBuffer(event.target.files[0])
  }
  async function process() {
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(i)
      const pdfP = await pdf.getPage(i)
      const content = await pdfP.getTextContent()
      const contentStr = content.items.reduce((a, b) => a + b.str, '') as string
      console.log(contentStr.split('ม.4'))
    }
  }
  if (pdf !== null) {
    process()
  }*/
  const data = [
    { subject: 'วิทยาศาสตร์', name: 'พีรพงศ์', meeting: '8738747890', code: '535466' },
    { subject: 'การออกแบบและเทคโนโลยี', name: 'คมเวช', meeting: '8654819778', code: '1234' },
    { subject: 'วิทยาศาสตร์', name: 'กนต์ธีร์', meeting: '5777191684', code: '6HLhvl' },
    { subject: 'ภาษาไทย', name: 'พิมพิศา', meeting: '5297813981', code: '1234' },
    { subject: 'วิทยาศาสตร์', name: 'ดวงใจ', meeting: '2440266793', code: '123456' },
    { subject: 'ภาษาอังกฤษ', name: 'ชัยเดช', meeting: '6998474263', code: '123456' },
    { subject: 'แนะแนว', name: 'ชิดาพันธุ์', meeting: '4349839745', code: '1234' },
    { subject: 'ภาษาไทย', name: 'ยศชวิน', meeting: '6250258916', code: '8916' },
    { subject: 'การงานอาชีพ', name: 'อารีรัตน์', meeting: '2358395699', code: '2518' },
    { subject: 'ภาษาต่างประเทศ', name: 'Shogo', meeting: '3735870036', code: 'Jppm' },
    { subject: 'สังคมศึกษา', name: 'พีลาภ', meeting: '6402657923', code: 'Peelarp' },
    { subject: 'สังคมศึกษา', name: 'พีลาภ', meeting: '6402657923', code: 'Peelarp' },
    { subject: 'ศิลปะ', name: 'อติพงศ์', meeting: '7980266237', code: '4130' },
    { subject: 'สังคมศึกษา', name: 'นราธิป', meeting: '9978144654', code: '7201' },
    { subject: 'ภาษาต่างประเทศ', name: 'Zhang', meeting: '3704350325', code: 'Chinese369' },
    { subject: 'ภาษาอังกฤษ', name: 'ไอฟ้า', meeting: '8143962417', code: '4444' },
    { subject: 'วิทยาศาสตร์', name: 'ศุภษิกานต์', meeting: '5618092360', code: '629191' },
    { subject: 'ภาษาอังกฤษ', name: 'ทุติยพร', meeting: '8586584823', code: '7890' },
    { subject: 'ภาษาอังกฤษ', name: 'Rudyl', meeting: '9126414649', code: 'A. Rudyl' },
    { subject: 'สังคมศึกษา', name: 'สุวัตร์', meeting: '9776437395', code: '123456' },
    { subject: 'คณิตศาสตร์', name: 'ประเวศ', meeting: '7194996310', code: '1234' },
    { subject: 'คณิตศาสตร์', name: 'ประเวศ', meeting: '7194996310', code: '1234' },
    { subject: 'วิทยาศาสตร์', name: 'วารุณี', meeting: '7651178250', code: 'yO8TqF' },
    { subject: 'ศิลปะ', name: 'ชุลีรัตน์', meeting: '9556600849', code: '2507' },
    { subject: 'ภาษาอังกฤษ', name: 'ทุติยพร', meeting: '8586584823', code: '7890' },
    { subject: 'ภาษาอังกฤษ', name: 'William', meeting: '', code: '' },
    { subject: 'ภาษาอังกฤษ', name: 'Mark', meeting: '2789627981', code: 'English 101' },
    { subject: 'สุขศึกษาและพลศึกษา', name: 'ประพันธ์', meeting: '4265211900', code: '2507' },
    { subject: 'วิทยาศาสตร์', name: 'มนตรี', meeting: '5460099109', code: '409' },
  ]
  /* useEffect(() => {
    proc().then(() => console.log('OK'))
  }, [])*/
  async function proc() {
    await Promise.all(
      data.map(async (d) => {
        const ref = db.collection('meetings').where('meeting', '==', d.meeting)
        console.log(ref)
        try {
          if ((await ref.get()).docs.length !== 0) return
          await db.collection('meetings').doc().set(d)
        } catch (err) {
          console.error(err)
        }
      })
    )
  }
  return <div></div>
}
