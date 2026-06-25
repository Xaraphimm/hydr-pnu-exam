import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../ThemeContext.jsx'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="fixed top-3 right-3 z-50 rounded-full shadow-sm sm:top-4 sm:right-4"
    >
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
