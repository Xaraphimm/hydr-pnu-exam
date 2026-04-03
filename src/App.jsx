import { ThemeProvider } from './ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import './styles/reset.css'
import './styles/theme.css'
import './styles/global.css'

export default function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <div className="container">
        <p>Theme system works. Toggle the sun/moon icon.</p>
      </div>
    </ThemeProvider>
  )
}
