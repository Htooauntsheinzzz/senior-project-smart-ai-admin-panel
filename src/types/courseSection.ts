export type CourseSection = {
  id: string; courseId: string; number: string; lecturerId: string; room: string; schedule: string;
  capacity: number; enrolled: number; semester: string; academicYear: string; status: 'active' | 'closed'
}
export type SectionDraft = Omit<CourseSection, 'id' | 'enrolled' | 'capacity'> & { capacity: string }
export type SectionFilters = { query: string; courseId: string; semester: string; academicYear: string; lecturerId: string; status: string }
