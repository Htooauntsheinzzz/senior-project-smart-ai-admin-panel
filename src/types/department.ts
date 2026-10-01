export type DepartmentInput = { code: string; name: string; facultyId: string; status: 'active' | 'inactive' }
export type Department = DepartmentInput & { id: string; programCount: number; courseCount: number; studentCount: number }
export type DepartmentFilters = { query: string; facultyId: string; status: string }
