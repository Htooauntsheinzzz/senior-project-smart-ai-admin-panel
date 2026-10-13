export type LecturerStatus = 'active' | 'inactive'
export type LecturerDraft = { nameTh: string; nameEn: string; nickname: string; facultyId: string; departmentId: string; status: LecturerStatus }
export type LecturerFilters = { query: string; facultyId: string; departmentId: string; status: string }
