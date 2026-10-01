export type FacultyStatus = 'active' | 'inactive'
export type FacultyInput = { code: string; nameEn: string; nameTh: string; status: FacultyStatus }
export type Faculty = FacultyInput & { id: string; departmentCount: number; studentCount: number }
