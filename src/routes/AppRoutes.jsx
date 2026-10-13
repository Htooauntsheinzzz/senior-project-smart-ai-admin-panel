import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import AdminUsersPage from '../pages/users/AdminUsersPage'
import AdminUsersContent from '../components/users/AdminUsersContent'
import AddAdminUserContent from '../components/users/AddAdminUserContent'
import StudentsPage from '../pages/students/StudentsPage'
import AcademicManagementPage from '../pages/academic/AcademicManagementPage'
import TimetablePage from '../pages/timetable/TimetablePage'
import FacultiesPage from '../pages/faculties/FacultiesPage'
import DepartmentsPage from '../pages/departments/DepartmentsPage'
import ProgramsPage from '../pages/programs/ProgramsPage'
import CoursesPage from '../pages/courses/CoursesPage'
import CoursesContent from '../components/courses/CoursesContent'
import AddCourseContent from '../components/courses/AddCourseContent'
import SectionsPage from '../pages/sections/SectionsPage'
import EnrollmentsPage from '../pages/enrollments/EnrollmentsPage'
import ProtectedRoute from './ProtectedRoute'
import AssignmentsPage from '../pages/assignments/AssignmentsPage'
import ExamsPage from '../pages/exams/ExamsPage'
import CampusMapPage from '../pages/campus/CampusMapPage'
import BuildingsPage from '../pages/campus/BuildingsPage'
import RoomsPage from '../pages/campus/RoomsPage'
import CampusPlacesPage from '../pages/campus/CampusPlacesPage'
import NavigationRoutesPage from '../pages/campus/NavigationRoutesPage'
import AnnouncementsPage from '../pages/communication/AnnouncementsPage'
import NotificationsPage from '../pages/communication/NotificationsPage'
import RemindersPage from '../pages/communication/RemindersPage'
import UniversitySettingsPage from '../pages/settings/UniversitySettingsPage'
import AuditLogsPage from '../pages/settings/AuditLogsPage'

function RootRedirect() {
  const { isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FC] px-6 text-center">
        <div role="status">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-[#E5E8F0] border-t-[#273238]" />
          <p className="mt-4 text-sm font-medium text-[#68728A]">
            Checking authentication...
          </p>
        </div>
      </main>
    )
  }

  return (
    <Navigate replace to={isAuthenticated ? '/admin/dashboard' : '/login'} />
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route index element={<Navigate replace to="dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<AdminUsersPage />}>
          <Route index element={<AdminUsersContent />} />
          <Route path="new" element={<AddAdminUserContent />} />
          <Route path="create" element={<AddAdminUserContent />} />
          <Route path=":id" element={<AdminUsersContent />} />
          <Route path=":id/edit" element={<AddAdminUserContent />} />
        </Route>
        <Route path="students" element={<StudentsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="campus-map" element={<CampusMapPage />} />
        <Route path="buildings" element={<BuildingsPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="campus-places" element={<CampusPlacesPage />} />
        <Route path="navigation-routes" element={<NavigationRoutesPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="university-settings" element={<UniversitySettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="semesters" element={<AcademicManagementPage kind="semesters" />} />
        <Route path="lectures" element={<AcademicManagementPage kind="lectures" />} />
        <Route path="faculties" element={<FacultiesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="sections" element={<SectionsPage />} />
        <Route path="enrollments" element={<EnrollmentsPage />} />
        <Route path="courses" element={<CoursesPage />}>
          <Route index element={<CoursesContent />} />
          <Route path="new" element={<AddCourseContent />} />
          <Route path=":id/edit" element={<AddCourseContent />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
