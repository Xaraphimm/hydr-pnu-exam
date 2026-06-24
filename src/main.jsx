import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HistoryProvider } from './HistoryContext.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <HistoryProvider>
        <App />
      </HistoryProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
