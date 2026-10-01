import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { loadDemoCourses } from '../../services/courseDemo'
import type { Course } from '../../types/course'
import { emptyCourseFilters } from '../../utils/courses'
import type { CourseCatalogContext } from './courseCatalogContext'

export default function CourseCatalog({ loadCourses = loadDemoCourses }: { loadCourses?: () => Promise<Course[]> }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [state, setState] = useState<CourseCatalogContext['state']>('loading')
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState({ ...emptyCourseFilters })
  const [message, setMessage] = useState('')
  useEffect(() => {
    let cancelled = false
    loadCourses().then(records => { if (!cancelled) { setCourses(records); setState('ready') } }).catch(() => { if (!cancelled) setState('error') })
    return () => { cancelled = true }
  }, [attempt, loadCourses])
  const context: CourseCatalogContext = { courses, setCourses, state, filters, setFilters, message, setMessage, retry: () => { setState('loading'); setAttempt(previous => previous + 1) } }
  return <Outlet context={context} />
}
