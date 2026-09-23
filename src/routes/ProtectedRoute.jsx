import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
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

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return <Outlet />
}
