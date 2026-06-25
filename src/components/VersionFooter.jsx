import { APP_VERSION } from '../constants/version.js'
import './VersionFooter.css'

export default function VersionFooter() {
  return (
    <footer className="version-footer" aria-label={`Application version ${APP_VERSION}`}>
      Version {APP_VERSION}
    </footer>
  )
}
