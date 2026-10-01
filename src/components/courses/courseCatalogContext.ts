import type { Dispatch, SetStateAction } from 'react'
import type { Course, CourseFilters } from '../../types/course'

export type CourseCatalogContext = {
  courses: Course[]; setCourses: Dispatch<SetStateAction<Course[]>>
  state: 'loading' | 'ready' | 'error'; retry: () => void
  filters: CourseFilters; setFilters: Dispatch<SetStateAction<CourseFilters>>
  message: string; setMessage: Dispatch<SetStateAction<string>>
}
