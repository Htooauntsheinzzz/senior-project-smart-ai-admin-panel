import apiClient from '../api/apiClient'

export interface DepartmentOption {
  id: number
  departmentCode?: string
  departmentName: string
}

export interface DepartmentPage {
  content: DepartmentOption[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface DepartmentListParams {
  page?: number
  size?: number
  search?: string
  facultyId?: number
  status?: string
  sort?: string
}

export async function getDepartments(params: DepartmentListParams = {}): Promise<DepartmentPage> {
  const response = await apiClient.get('/departments', { params })
  return response.data
}
