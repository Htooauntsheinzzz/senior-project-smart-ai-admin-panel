// Admin Timetable types (spec 40). Shapes follow the backend DTOs in
// feature/timetable/dto; ids are kept as strings in the UI like the other modules.

export type MeetingStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
export type MeetingType = 'LECTURE' | 'LAB' | 'TUTORIAL'
export type OccurrenceStatus = 'REGULAR' | 'RESCHEDULED' | 'CANCELLED'
export type ConflictType = 'ROOM_CONFLICT' | 'LECTURER_CONFLICT' | 'COURSE_SECTION_CONFLICT'
export type TermStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED'

/** One dropdown entry of GET /timetable/filter-options; parentId drives the cascades. */
export interface TimetableOption { id: string; code: string; name: string; parentId: string | null }

export interface FilterOptions {
  academicTerms: TimetableOption[]
  faculties: TimetableOption[]
  departments: TimetableOption[]
  courses: TimetableOption[]
  courseSections: TimetableOption[]
  lecturers: TimetableOption[]
  campuses: TimetableOption[]
  buildings: TimetableOption[]
  rooms: TimetableOption[]
  meetingTypes: string[]
  statuses: string[]
}

/** GET /academic-terms: a year-specific offering of a semester with verified calendar dates. */
export interface AcademicTerm {
  id: string
  semesterId: string
  semesterNameEn: string
  semesterNameTh: string
  semesterAcademicYear: number | null
  academicYearCode: string
  academicYearLabel: string
  startDate: string
  endDate: string
  status: TermStatus
  displayLabel: string
}

export interface AcademicTermDraft { semesterId: string; academicYearCode: string; academicYearLabel: string; startDate: string; endDate: string; status: TermStatus }

/** One dated occurrence of GET /timetable/calendar. Times are the university's local wall-clock minutes. */
export interface CalendarEvent {
  meetingId: string
  courseSectionId: string
  courseCode: string
  courseName: string
  sectionNumber: string
  lecturerId: string
  lecturerName: string
  facultyId: string
  departmentId: string
  roomId: string | null
  roomNumber: string | null
  buildingId: string | null
  buildingName: string | null
  campusId: string | null
  meetingType: MeetingType
  date: string
  startMinutes: number
  endMinutes: number
  status: MeetingStatus
  occurrenceStatus: OccurrenceStatus
  exceptionId: string | null
  originalDate: string | null
}

export interface CalendarWeek { academicTermId: string | null; weekStart: string; weekEnd: string; timezone: string; events: CalendarEvent[] }

export interface MeetingListItem {
  id: string
  courseSectionId: string
  courseCode: string
  courseName: string
  sectionNumber: string
  facultyId: string
  facultyName: string
  departmentId: string
  departmentName: string
  lecturerId: string
  lecturerName: string
  academicTermId: string | null
  academicYearLabel: string | null
  semesterName: string
  dayOfWeek: number
  dayName: string
  startTime: string
  endTime: string
  campusId: string | null
  campusName: string | null
  buildingId: string | null
  buildingName: string | null
  roomId: string | null
  roomNumber: string | null
  legacyRoomLabel: string | null
  meetingType: MeetingType
  status: MeetingStatus
  effectiveFrom: string
  effectiveTo: string
  /** Last day to enroll into the section (backend V47); null means no deadline. */
  enrollmentDueDate: string | null
}

export interface TimetablePage<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }

export interface NamedRef { id: string; code: string; name: string }

export interface TermRef { id: string; semesterId: string; semesterName: string; semesterNameTh: string; academicYearCode: string; academicYearLabel: string; startDate: string; endDate: string; status: TermStatus }

export interface MeetingLocation {
  campusId: string | null; campusName: string | null
  buildingId: string | null; buildingCode: string | null; buildingName: string | null
  roomId: string | null; roomNumber: string | null; roomName: string | null
  floorNumber: number | null; capacity: number | null; legacyRoomLabel: string | null
}

/** GET /timetable/meetings/{id}: the authoritative record used by the details drawer and the edit form. */
export interface MeetingDetail {
  id: string
  courseSection: NamedRef
  course: NamedRef
  academicTerm: TermRef | null
  faculty: NamedRef
  department: NamedRef
  lecturer: NamedRef
  location: MeetingLocation
  meetingType: MeetingType
  dayOfWeek: number
  dayName: string
  startTime: string
  endTime: string
  effectiveFrom: string
  effectiveTo: string
  enrollmentDueDate: string | null
  status: MeetingStatus
  notes: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface ConflictMeeting {
  meetingId: string; courseSectionId: string; courseCode: string; courseName: string; sectionNumber: string
  meetingType: MeetingType; dayOfWeek: number; startTime: string; endTime: string; effectiveFrom: string; effectiveTo: string
  roomId: string | null; roomNumber: string | null; lecturerId: string; lecturerName: string
}

/** GET /timetable/conflicts: two published meetings sharing a room, lecturer or section on a real occurrence. */
export interface ConflictPair {
  type: ConflictType
  meetingA: ConflictMeeting
  meetingB: ConflictMeeting
  firstDate: string
  overlapStart: string
  overlapEnd: string
  occurrenceCount: number
  roomId: string | null
  roomNumber: string | null
  lecturerId: string | null
  lecturerName: string | null
  courseSectionId: string | null
}

export interface ConflictList { total: number; conflicts: ConflictPair[] }

/** POST /timetable/conflicts/check result. */
export interface ConflictCheck {
  hasConflicts: boolean
  totalConflicts: number
  conflicts: { type: ConflictType; conflictingMeetingId: string; message: string; date: string; overlapStart: string; overlapEnd: string }[]
}

export interface TimetableStatistics { totalMeetings: number; publishedMeetings: number; draftMeetings: number; cancelledMeetings: number; conflictCount: number }

/** The Add / Edit Class Schedule form. Lecturer, semester and academic year derive from the section. */
export interface ScheduleDraft {
  courseId: string
  courseSectionId: string
  meetingType: MeetingType | ''
  dayOfWeek: string
  startTime: string
  endTime: string
  buildingId: string
  roomId: string
  effectiveFrom: string
  effectiveTo: string
  /** Optional; must not be after effectiveFrom. */
  enrollmentDueDate: string
  notes: string
}
export type ScheduleField = keyof ScheduleDraft

export interface TimetableFilters { semesterId: string; academicTermId: string; facultyId: string; departmentId: string; courseId: string }

export type ListSortField = 'courseCode' | 'dayOfWeek' | 'startTime' | 'lecturerName' | 'roomNumber' | 'status'
export interface ListSort { field: ListSortField; direction: 'asc' | 'desc' }

export interface FacultyColor { key: string; label: string; color: string; background: string; foreground: string }
