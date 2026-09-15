import { Navigate, Outlet } from 'react-router'
import { SocketProvider } from '@/components/socket/SocketProvider'
import { useAuthStore } from '@/stores/authStore'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.broker) {
    return <Navigate to="/broker" replace />
  }

  return (
    <SocketProvider>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Glow blobs — visible only in glass theme */}
        <div className="glow-blob glow-blob-1" />
        <div className="glow-blob glow-blob-2" />
        <div className="glow-blob glow-blob-3" />

        {/* Top navigation bar */}
        <Navbar />

        {/* Page content — scrolls independently */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* Footer — hidden on mobile */}
        <Footer className="hidden md:block" />
      </div>
    </SocketProvider>
  )
}
