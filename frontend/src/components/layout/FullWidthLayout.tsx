import { Navigate, Outlet } from 'react-router'
import { SocketProvider } from '@/components/socket/SocketProvider'
import { useAuthStore } from '@/stores/authStore'
import { Navbar } from './Navbar'

/**
 * Full-width layout for apps like Trading, Playground, Agent, FlowEditor,
 * Historify that need maximum screen space. Uses the same Navbar component
 * as Layout but with `fluid` for edge-to-edge content.
 */
export function FullWidthLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.broker) {
    return <Navigate to="/broker" replace />
  }

  return (
    <SocketProvider>
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        {/* Top navigation bar — fluid for full-width pages */}
        <Navbar fluid />

        {/* Full-width content — no container constraint */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </SocketProvider>
  )
}
