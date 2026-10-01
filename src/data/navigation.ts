import { Activity, BarChart3, BookOpen, Bot, Building2, CalendarDays, GraduationCap, LayoutDashboard, Megaphone, Settings, Users, type LucideIcon } from 'lucide-react'

type Destination = { id: string; label: string; to?: string }
export type NavigationItem = Destination & { icon: LucideIcon; children?: Destination[] }

export const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { id: 'users', label: 'User Management', icon: Users, to: '/admin/users' },
  { id: 'students', label: 'Students', icon: GraduationCap, to: '/admin/students' },
  { id: 'academic', label: 'Academic Management', icon: BookOpen, children: [
    { id: 'faculties', label: 'Faculties', to: '/admin/faculties' },
    { id: 'departments', label: 'Departments', to: '/admin/departments' },
    { id: 'programs', label: 'Programs & Majors', to: '/admin/programs' },
    { id: 'courses', label: 'Courses', to: '/admin/courses' },
    { id: 'sections', label: 'Course Sections', to: '/admin/sections' },
    { id: 'enrollments', label: 'Enrollments', to: '/admin/enrollments' },
  ] },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays, to: '/admin/timetable' },
  { id: 'activities', label: 'Academic Activities', icon: Activity, children: [
    { id: 'assignments', label: 'Assignments' },
    { id: 'exams', label: 'Exams' },
  ] },
  { id: 'campus', label: 'Campus Management', icon: Building2, children: [
    { id: 'map', label: 'Campus Map' },
    { id: 'buildings', label: 'Buildings' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'places', label: 'Campus Places' },
    { id: 'routes', label: 'Navigation Routes' },
  ] },
  { id: 'ai', label: 'AI Management', icon: Bot, children: [
    { id: 'knowledge', label: 'AI Knowledge Base' },
    { id: 'test-knowledge', label: 'Test AI Knowledge' },
    { id: 'assistant', label: 'AI Assistant' },
    { id: 'history', label: 'Chat History' },
    { id: 'feedback', label: 'AI Feedback' },
  ] },
  { id: 'communication', label: 'Communication', icon: Megaphone, children: [
    { id: 'announcements', label: 'Announcements' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'reminders', label: 'Smart Reminders' },
  ] },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings, children: [
    { id: 'university', label: 'University Settings' },
    { id: 'audit', label: 'Audit Logs' },
  ] },
]
