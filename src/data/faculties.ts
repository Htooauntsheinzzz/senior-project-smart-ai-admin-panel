import type { Faculty } from '../types/faculty'

// Figma directory fixtures; no faculty service is connected.
export const initialFaculties: Faculty[] = [
  { id: 'eng', code: 'FAC-ENG', nameEn: 'Faculty of Engineering', nameTh: 'คณะวิศวกรรมศาสตร์', departmentCount: 3, studentCount: 320, status: 'active' },
  { id: 'it', code: 'FAC-IT', nameEn: 'Faculty of Information Technology', nameTh: 'คณะเทคโนโลยีสารสนเทศ', departmentCount: 3, studentCount: 285, status: 'active' },
  { id: 'biz', code: 'FAC-BIZ', nameEn: 'Faculty of Business Administration', nameTh: 'คณะบริหารธุรกิจ', departmentCount: 3, studentCount: 412, status: 'active' },
  { id: 'sci', code: 'FAC-SCI', nameEn: 'Faculty of Science', nameTh: 'คณะวิทยาศาสตร์', departmentCount: 3, studentCount: 178, status: 'active' },
  { id: 'med', code: 'FAC-MED', nameEn: 'Faculty of Medicine', nameTh: 'คณะแพทยศาสตร์', departmentCount: 3, studentCount: 203, status: 'active' },
  { id: 'la', code: 'FAC-LA', nameEn: 'Faculty of Liberal Arts', nameTh: 'คณะศิลปศาสตร์', departmentCount: 3, studentCount: 156, status: 'active' },
  { id: 'law', code: 'FAC-LAW', nameEn: 'Faculty of Law', nameTh: 'คณะนิติศาสตร์', departmentCount: 2, studentCount: 89, status: 'inactive' },
]
