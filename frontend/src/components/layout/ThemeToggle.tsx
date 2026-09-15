import { Moon, Sun, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeStore } from '@/stores/themeStore'
import type { ThemeMode } from '@/stores/themeStore'

const themeConfig: Record<ThemeMode, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
  glass: { icon: Droplets, label: 'Glass' },
}

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title={`Current theme: ${themeConfig[mode].label}. Click to change.`}
          aria-label={`Theme: ${themeConfig[mode].label}`}
        >
          {(() => {
            const Icon = themeConfig[mode].icon
            return <Icon className="h-4 w-4" />
          })()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(themeConfig) as ThemeMode[]).map((theme) => {
          const { icon: Icon, label } = themeConfig[theme]
          return (
            <DropdownMenuItem
              key={theme}
              onClick={() => setMode(theme)}
              className="cursor-pointer"
            >
              <Icon className="h-4 w-4 mr-2" />
              <span>{label}</span>
              {mode === theme && <span className="ml-auto text-primary">&#10003;</span>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
