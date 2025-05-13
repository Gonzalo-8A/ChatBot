import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher.jsx';
import ToggleTheme  from '../ToggleTheme/ToggleTheme.jsx'
import './Header.css'

export default function Header() {
  return (
    <div className="header">
      <ToggleTheme />
      <LanguageSwitcher />
    </div>
  )
}