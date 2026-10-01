import { initialCourses } from '../data/courses'
import type { Course } from '../types/course'

// Replace this explicitly local adapter when a catalog endpoint is agreed.
export async function loadDemoCourses(): Promise<Course[]> {
  return initialCourses
}
