import type { AdminUser } from '../types/adminUser'

// The first eight records reproduce the visible Figma frame. Creation dates and
// the remaining four records are demo fixtures; page two is not in that frame.
export const initialAdminUsers: AdminUser[] = [
  { id: 1, name: 'Somchai Pongpai', employeeId: 'RSU-001', email: 'somchai.p@rsu.ac.th', department: 'IT Services', role: 'Super Admin', status: 'Active', lastLogin: 'Today, 09:14', createdAt: '2026-01-10' },
  { id: 2, name: 'Nipa Chaiya', employeeId: 'RSU-042', email: 'nipa.c@rsu.ac.th', department: 'Academic Affairs', role: 'Academic Admin', status: 'Active', lastLogin: 'Today, 08:50', createdAt: '2026-01-12' },
  { id: 3, name: 'Kanya Srisuk', employeeId: 'RSU-107', email: 'kanya.s@rsu.ac.th', department: 'Registrar Office', role: 'Registrar Admin', status: 'Active', lastLogin: 'Yesterday, 15:32', createdAt: '2026-02-01' },
  { id: 4, name: 'Supawit Kamnerd', employeeId: 'RSU-218', email: 'supawit.k@rsu.ac.th', department: 'Academic Affairs', role: 'Academic Admin', status: 'Active', lastLogin: 'Aug 28, 2026', createdAt: '2026-02-05' },
  { id: 5, name: 'Panida Thongchai', employeeId: 'RSU-330', email: 'panida.t@rsu.ac.th', department: 'IT Services', role: 'AI Content Admin', status: 'Active', lastLogin: 'Aug 27, 2026', createdAt: '2026-03-01' },
  { id: 6, name: 'Mark Williams', employeeId: 'RSU-455', email: 'mark.w@rsu.ac.th', department: 'Student Services', role: 'Registrar Admin', status: 'Inactive', lastLogin: 'Jul 15, 2026', createdAt: '2026-03-05' },
  { id: 7, name: 'Araya Buranasiri', employeeId: 'RSU-512', email: 'araya.b@rsu.ac.th', department: 'Campus Operations', role: 'Campus Admin', status: 'Active', lastLogin: 'Today, 07:22', createdAt: '2026-04-01' },
  { id: 8, name: 'Prasert Sombat', employeeId: 'RSU-614', email: 'prasert.s@rsu.ac.th', department: 'Library Services', role: 'AI Content Admin', status: 'Inactive', lastLogin: 'Jun 02, 2026', createdAt: '2026-04-05' },
  { id: 9, name: 'Demo Academic Admin', employeeId: 'DEMO-009', email: 'academic@example.com', department: 'Academic Affairs', role: 'Academic Admin', status: 'Active', lastLogin: 'Never', createdAt: '2026-08-01' },
  { id: 10, name: 'Demo Campus Admin', employeeId: 'DEMO-010', email: 'campus@example.com', department: 'Campus Operations', role: 'Campus Admin', status: 'Active', lastLogin: 'Never', createdAt: '2026-08-01' },
  { id: 11, name: 'Demo Registrar Admin', employeeId: 'DEMO-011', email: 'registrar@example.com', department: 'Registrar Office', role: 'Registrar Admin', status: 'Active', lastLogin: 'Never', createdAt: '2026-08-01' },
  { id: 12, name: 'Demo Content Admin', employeeId: 'DEMO-012', email: 'content@example.com', department: 'Library Services', role: 'AI Content Admin', status: 'Inactive', lastLogin: 'Never', createdAt: '2026-08-01' },
]
