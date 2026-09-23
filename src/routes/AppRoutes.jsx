import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import ProtectedRoute from './ProtectedRoute'

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
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
