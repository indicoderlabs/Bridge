import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'glass'
export type AppMode = 'live' | 'analyzer'
export type ThemeColor =
  | 'zinc'
  | 'slate'
  | 'stone'
  | 'gray'
  | 'neutral'
  | 'red'
  | 'rose'
  | 'orange'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'violet'

// Event emitter for mode changes
type ModeChangeCallback = (newMode: AppMode) => void
const modeChangeListeners: Set<ModeChangeCallback> = new Set()

export const onModeChange = (callback: ModeChangeCallback): (() => void) => {
  modeChangeListeners.add(callback)
  return () => {
    modeChangeListeners.delete(callback)
  }
}

const notifyModeChange = (newMode: AppMode) => {
  modeChangeListeners.forEach((cb) => cb(newMode))
}

// Apply theme classes to <html> element (does not check appMode)
function applyThemeClasses(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove('dark', 'glass')
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'glass') {
    document.documentElement.classList.add('glass')
  }
  // 'light' = no extra class (base state)
}

interface ThemeStore {
  mode: ThemeMode
  color: ThemeColor
  appMode: AppMode
  isTogglingMode: boolean

  setMode: (mode: ThemeMode) => void
  setColor: (color: ThemeColor) => void
  setAppMode: (appMode: AppMode) => void
  toggleMode: () => void
  toggleAppMode: () => Promise<{ success: boolean; message?: string }>
  syncAppMode: () => Promise<void>
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'light',
      color: 'zinc',
      appMode: 'live',
      isTogglingMode: false,

      setMode: (mode) => {
        set({ mode })
        applyThemeClasses(mode)
      },

      setColor: (color) => {
        set({ color })
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', color)
        }
      },

      setAppMode: (appMode) => {
        const previousMode = get().appMode
        set({ appMode })
        if (typeof document !== 'undefined') {
          // Remove all mode classes first
          document.documentElement.classList.remove('analyzer', 'sandbox', 'dark', 'glass')

          if (appMode === 'analyzer') {
            // Analyzer mode: apply analyzer class + current theme (light/dark/glass all work)
            document.documentElement.classList.add('analyzer')
            applyThemeClasses(get().mode)
          } else {
            // Live mode: apply the current theme preference
            applyThemeClasses(get().mode)
          }
        }
        // Notify listeners if mode changed
        if (previousMode !== appMode) {
          notifyModeChange(appMode)
        }
      },

      toggleMode: () => {
        const cycle: ThemeMode[] = ['light', 'dark', 'glass']
        const current = cycle.indexOf(get().mode)
        const newMode = cycle[(current + 1) % cycle.length]
        set({ mode: newMode })
        applyThemeClasses(newMode)
      },

      // Toggle app mode via backend API
      toggleAppMode: async (): Promise<{ success: boolean; message?: string }> => {
        if (get().isTogglingMode) return { success: false, message: 'Already toggling' }

        set({ isTogglingMode: true })
        try {
          // First fetch CSRF token
          const csrfResponse = await fetch('/auth/csrf-token', {
            credentials: 'include',
          })
          const csrfData = await csrfResponse.json()

          const response = await fetch('/auth/analyzer-toggle', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfData.csrf_token,
            },
          })

          const data = await response.json()

          if (response.ok && data.status === 'success') {
            const newMode: AppMode = data.data.analyze_mode ? 'analyzer' : 'live'
            get().setAppMode(newMode)
            return { success: true, message: data.data.message }
          } else {
            return { success: false, message: data.message || 'Failed to toggle mode' }
          }
        } catch (_error) {
          return { success: false, message: 'Network error' }
        } finally {
          set({ isTogglingMode: false })
        }
      },

      // Sync app mode from backend
      syncAppMode: async () => {
        try {
          const response = await fetch('/auth/analyzer-mode', {
            credentials: 'include',
          })

          if (response.ok) {
            const data = await response.json()
            if (data.status === 'success') {
              const backendMode: AppMode = data.data.analyze_mode ? 'analyzer' : 'live'
              const currentMode = get().appMode
              if (currentMode !== backendMode) {
                get().setAppMode(backendMode)
              }
            }
            // If backend returns error status but response.ok, keep current appMode
          }
          // If request fails (401, etc.) - user is logged out, keep current appMode
          // This preserves the theme across logout for visual continuity
        } catch (_error) {
          // On error, keep current appMode - preserves theme across logout
        }
      },
    }),
    {
      name: 'openalgo-theme',
      partialize: (state) => ({
        mode: state.mode,
        color: state.color,
        appMode: state.appMode, // Persist appMode for visual continuity across logout
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on rehydration
        if (state && typeof document !== 'undefined') {
          document.documentElement.classList.remove('analyzer', 'sandbox', 'dark', 'glass')

          // Apply persisted appMode for visual continuity
          if (state.appMode === 'analyzer') {
            document.documentElement.classList.add('analyzer')
          }
          // Apply theme classes for any mode (live or analyzer)
          applyThemeClasses(state.mode)
          document.documentElement.setAttribute('data-theme', state.color)
        }
      },
    }
  )
)
