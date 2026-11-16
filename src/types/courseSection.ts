export type CourseSection = {
  id: string; courseId: string; number: string; lecturerId: string;
  capacity: number; enrolled: number; semester: string; academicYear: string; status: 'active' | 'closed'; isFull?: boolean
}
export type SectionDraft = Omit<CourseSection, 'id' | 'enrolled' | 'capacity' | 'isFull'> & { capacity: string; academicTermId: string }
export type SectionFilters = { query: string; courseId: string; semester: string; academicYear: string; lecturerId: string; status: string }
