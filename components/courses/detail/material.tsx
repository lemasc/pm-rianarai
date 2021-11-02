import { useMaterials } from '@/shared/api'
import { useEffect } from 'react'
import { useCourseView } from '../viewContext'
import DetailModal from './modal'

export default function MaterialDetail() {
  const { course, contentModal } = useCourseView()
  const { data } = useMaterials(contentModal.id && course.id, contentModal.id)
  const material = data?.get(contentModal.id)

  if (!contentModal.id || !course) return null
  return <DetailModal data={material} type="เนื้อหา" />
}
