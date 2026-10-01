import { BookOpen, Bot, Building2, CalendarDays, FileText, GraduationCap, Megaphone, Upload, UserPlus, type LucideIcon } from 'lucide-react'

export type Accent = 'neutral' | 'purple' | 'orange' | 'green' | 'pink' | 'cyan'
export type DashboardAction = 'Add Student' | 'Add Course' | 'Create Timetable' | 'Upload AI Document' | 'Create Announcement' | 'View all events' | 'View activity log' | 'IT Support'
export type ActionHandler = (action: DashboardAction) => void
export type Stat = { id: string; value: string; label: string; detail: string; accent: Accent; icon: LucideIcon }

export const statistics: Stat[] = [
  { id: 'students', value: '12,847', label: 'Total Students', detail: '+234 this month', accent: 'neutral', icon: GraduationCap },
  { id: 'courses', value: '384', label: 'Total Courses', detail: '5 added this week', accent: 'purple', icon: BookOpen },
  { id: 'classes', value: '126', label: "Today's Classes", detail: '18 currently live', accent: 'orange', icon: CalendarDays },
  { id: 'buildings', value: '23', label: 'Active Buildings', detail: 'All operational', accent: 'green', icon: Building2 },
  { id: 'questions', value: '1,304', label: 'AI Questions Today', detail: '+18.5% vs yesterday', accent: 'pink', icon: Bot },
  { id: 'documents', value: '2,198', label: 'Knowledge Documents', detail: '12 indexed today', accent: 'cyan', icon: FileText },
]
export const quickActions: { label: DashboardAction; accent: Accent; icon: LucideIcon }[] = [
  { label: 'Add Student', accent: 'neutral', icon: UserPlus },
  { label: 'Add Course', accent: 'purple', icon: BookOpen },
  { label: 'Create Timetable', accent: 'orange', icon: CalendarDays },
  { label: 'Upload AI Document', accent: 'pink', icon: Upload },
  { label: 'Create Announcement', accent: 'green', icon: Megaphone },
]
export const events = [
  { id: 'midterm', title: 'Mid-Term Examination Period', date: 'Sep 15–22, 2026', category: 'Examination', priority: 'HIGH' },
  { id: 'research', title: 'Faculty Research Symposium', date: 'Sep 28, 2026', category: 'Academic', priority: 'MEDIUM' },
  { id: 'orientation', title: 'New Student Orientation Day', date: 'Oct 3, 2026', category: 'Orientation', priority: 'MEDIUM' },
  { id: 'sports', title: 'Annual Campus Sports Festival', date: 'Oct 10–12, 2026', category: 'Activity', priority: 'LOW' },
  { id: 'grades', title: 'End-of-Term Grade Submission', date: 'Oct 30, 2026', category: 'Deadline', priority: 'HIGH' },
] as const
export const activities = [
  { id: 'student', title: 'Student account created', detail: 'Panida Thongchai enrolled in CS Year 1', time: '3 min ago', icon: UserPlus, accent: 'neutral' },
  { id: 'course', title: 'Course record updated', detail: 'CS301 Algorithms — seat capacity raised to 45', time: '18 min ago', icon: BookOpen, accent: 'purple' },
  { id: 'timetable', title: 'Timetable modified', detail: 'ICT-301 slot swapped — Monday → Wednesday 13:00', time: '42 min ago', icon: CalendarDays, accent: 'orange' },
  { id: 'handbook', title: 'Student handbook uploaded', detail: 'Student Handbook 2026 (128 pages) indexed', time: '1 hr ago', icon: Upload, accent: 'pink' },
  { id: 'announcement', title: 'Announcement published', detail: 'Mid-term notice sent to 4,218 students', time: '2 hr ago', icon: Megaphone, accent: 'green' },
] as const
export const classes = [
  { id: 'cs101', code: 'CS 101', title: 'Intro to Programming', room: 'ICT-201', time: '08:00–10:00', instructor: 'Dr. Kanya Srisuk', students: 52, status: 'Completed' },
  { id: 'cs301', code: 'CS 301', title: 'Algorithms & Data Structures', room: 'ICT-301', time: '10:00–12:00', instructor: 'Dr. Supawit Kamnerd', students: 41, status: 'Live Now' },
  { id: 'ba201', code: 'BA 201', title: 'Business Communication', room: 'BUS-401', time: '13:00–15:00', instructor: 'Asst. Prof. Nipa Chaiya', students: 67, status: 'Upcoming' },
  { id: 'eng102', code: 'ENG 102', title: 'Academic English II', room: 'HUM-105', time: '15:00–17:00', instructor: 'Dr. Mark Williams', students: 38, status: 'Upcoming' },
] as const
export const announcements = [
  { id: 'exam', category: 'Academic', time: 'Today, 09:14', title: 'Mid-Term Exam Schedule Released', body: 'The official mid-term timetable for Semester 1/2026 is now available in the student portal.', author: 'Registrar Office' },
  { id: 'maintenance', category: 'System', time: 'Yesterday', title: 'AI Assistant Maintenance Window', body: 'SMART AI will undergo scheduled maintenance on Saturday Sep 6, 02:00–04:00.', author: 'IT Services' },
  { id: 'library', category: 'Campus', time: 'Aug 28, 2026', title: 'Library Extended Hours — Exams', body: 'The main library will operate extended hours (07:00–23:00) throughout the exam period.', author: 'Library Services' },
] as const

// Demo values approximated from the written curve description, not extracted Figma geometry.
export const usage = [18, 12, 9, 35, 130, 210, 155, 245, 190, 145, 100, 55].map((value, index) => ({ time: `${String(index * 2).padStart(2, '0')}:00`, value }))
