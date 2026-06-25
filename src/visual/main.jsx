import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Gallery from './Gallery.jsx'
import { seedStorage } from './fixtures.js'
import '../styles/index.css'

const params = new URLSearchParams(window.location.search)
const screen = params.get('screen') || 'topic-list'
const theme = params.get('theme') === 'dark' ? 'dark' : 'light'

seedStorage(theme)
document.documentElement.setAttribute('data-theme', theme)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Gallery screen={screen} />
  </StrictMode>,
)
