import { Activity, BarChart3, BookOpen, Bot, Building2, CalendarDays, GraduationCap, LayoutDashboard, Megaphone, Settings, Users, type LucideIcon } from 'lucide-react'

type Destination = { id: string; label: string; to?: string }
export type NavigationItem = Destination & { icon: LucideIcon; children?: Destination[] }

export const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { id: 'users', label: 'User Management', icon: Users, to: '/admin/users' },
  { id: 'students', label: 'Students', icon: GraduationCap, to: '/admin/students' },
  { id: 'academic', label: 'Academic Management', icon: BookOpen, children: [
    { id: 'semesters', label: 'Semester', to: '/admin/semesters' },
    { id: 'faculties', label: 'Faculty', to: '/admin/faculties' },
    { id: 'departments', label: 'Department', to: '/admin/departments' },
    { id: 'lectures', label: 'Lectures', to: '/admin/lectures' },
    { id: 'programs', label: 'Program', to: '/admin/programs' },
    { id: 'courses', label: 'Courses', to: '/admin/courses' },
    { id: 'sections', label: 'Course Sections', to: '/admin/sections' },
    { id: 'enrollments', label: 'Enrollments', to: '/admin/enrollments' },
  ] },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays, to: '/admin/timetable' },
  { id: 'activities', label: 'Academic Activities', icon: Activity, children: [
    { id: 'assignments', label: 'Assignments', to: '/admin/assignments' },
    { id: 'exams', label: 'Exams', to: '/admin/exams' },
  ] },
  { id: 'campus', label: 'Campus Management', icon: Building2, children: [
    { id: 'map', label: 'Campus Map', to: '/admin/campus-map' },
    { id: 'buildings', label: 'Buildings', to: '/admin/buildings' },
    { id: 'rooms', label: 'Rooms', to: '/admin/rooms' },
    { id: 'places', label: 'Campus Places', to: '/admin/campus-places' },
    { id: 'routes', label: 'Navigation Routes', to: '/admin/navigation-routes' },
  ] },
  { id: 'ai', label: 'AI Management', icon: Bot, children: [
    { id: 'knowledge', label: 'AI Knowledge Base' },
    { id: 'test-knowledge', label: 'Test AI Knowledge' },
    { id: 'assistant', label: 'AI Assistant' },
    { id: 'history', label: 'Chat History' },
    { id: 'feedback', label: 'AI Feedback' },
  ] },
  { id: 'communication', label: 'Communication', icon: Megaphone, children: [
    { id: 'announcements', label: 'Announcements', to: '/admin/announcements' },
    { id: 'notifications', label: 'Notifications', to: '/admin/notifications' },
    { id: 'reminders', label: 'Smart Reminders', to: '/admin/reminders' },
  ] },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings, children: [
    { id: 'university', label: 'University Settings', to: '/admin/university-settings' },
    { id: 'audit', label: 'Audit Logs', to: '/admin/audit-logs' },
  ] },
]
