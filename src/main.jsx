import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HistoryProvider } from './HistoryContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HistoryProvider>
      <App />
    </HistoryProvider>
  </StrictMode>,
)
