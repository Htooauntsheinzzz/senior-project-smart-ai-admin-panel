import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import type { Course, CourseFilters } from '../../types/course'
import type { ApiCourse, CourseSummary } from '../../services/courseService'
import type { Faculty } from '../../types/faculty'
import type { ApiDepartment } from '../../services/departmentService'
import type { ApiProgram } from '../../services/programService'
import type { Semester } from '../../services/courseService'
import { getCourseDirectory, getCourseSummary } from '../../services/courseService'
import { getFaculties } from '../../services/facultyService'
import { getDepartmentDirectory } from '../../services/departmentService'
import { getProgramDirectory } from '../../services/programService'
import { getSemesters } from '../../services/courseService'
import { courseError, adaptApiCourseToCourse } from '../../utils/courseApi'
import { emptyCourseFilters } from '../../utils/courses'
import type { CourseCatalogContext } from './courseCatalogContext'

export default function CourseCatalog() {
  const [apiCourses, setApiCourses] = useState<ApiCourse[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [state, setState] = useState<CourseCatalogContext['state']>('loading')
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState<CourseFilters>({ ...emptyCourseFilters })
  const [message, setMessage] = useState('')
  const [summary, setSummary] = useState<CourseSummary | null>(null)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [programs, setPrograms] = useState<ApiProgram[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [lookupError, setLookupError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      getCourseDirectory(filters, controller.signal)
        .then(rows => {
          if (!controller.signal.aborted) {
            setApiCourses(rows)
            setCourses(rows.map(adaptApiCourseToCourse))
            setState('ready')
          }
        })
        .catch(error => {
          if (!controller.signal.aborted) {
            setState('error')
            setMessage(courseError(error).message)
          }
        })
    }, 300)
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [filters, attempt])

  useEffect(() => {
    const controller = new AbortController()
    getCourseSummary(controller.signal)
      .then(data => { if (!controller.signal.aborted) setSummary(data) })
      .catch(() => { /* summary failure is non-fatal */ })
    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getFaculties('', controller.signal),
      getDepartmentDirectory({ query: '', facultyId: '', status: '' }, controller.signal),
      getProgramDirectory({ query: '', facultyId: '', departmentId: '', degreeId: '', status: '' }, controller.signal),
      getSemesters(controller.signal),
    ]).then(([f, d, p, s]) => {
      if (controller.signal.aborted) return
      setFaculties(f)
      setDepartments(d)
      setPrograms(p)
      setSemesters(s)
      setLookupError('')
    }).catch(() => { if (!controller.signal.aborted) setLookupError('Unable to load lookup options.') })
    return () => controller.abort()
  }, [attempt])

  const context: CourseCatalogContext = {
    courses, setCourses, apiCourses, setApiCourses,
    state, summary, faculties, departments, programs, semesters, lookupError,
    filters, setFilters, message, setMessage,
    retry: () => { setState('loading'); setAttempt(previous => previous + 1) },
  }
  return <Outlet context={context} />
}
