import type { Dispatch, SetStateAction } from 'react'
import type { Course, CourseFilters } from '../../types/course'
import type { ApiCourse, CourseSummary, Semester } from '../../services/courseService'
import type { Faculty } from '../../types/faculty'
import type { ApiDepartment } from '../../services/departmentService'
import type { ApiProgram } from '../../services/programService'

export type CourseCatalogContext = {
  courses: Course[]; setCourses: Dispatch<SetStateAction<Course[]>>
  apiCourses: ApiCourse[]; setApiCourses: Dispatch<SetStateAction<ApiCourse[]>>
  state: 'loading' | 'ready' | 'error'
  summary: CourseSummary | null
  faculties: Faculty[]
  departments: ApiDepartment[]
  programs: ApiProgram[]
  semesters: Semester[]
  lookupError: string
  filters: CourseFilters; setFilters: Dispatch<SetStateAction<CourseFilters>>
  message: string; setMessage: Dispatch<SetStateAction<string>>
  retry: () => void
}
