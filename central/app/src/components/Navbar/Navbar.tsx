import { useState } from 'react'
import './Navbar.css'
import testIcon from '../../assets/icon/tests.png'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface NavbarProps {
  onTestsClick?: () => void
  onNavChange?: (id: string) => void
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'exploitations',
    label: 'Exploitations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
        <path d="M12 2a14.5 14.5 0 0 1 0 20A14.5 14.5 0 0 1 12 2" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    id: 'entrepots',
    label: 'Entrepôts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'mesures',
    label: 'Mesures',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 'alertes',
    label: 'Alertes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

export function Navbar({ onTestsClick, onNavChange }: NavbarProps) {
  const [activeId, setActiveId] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)

  const handleNavClick = (id: string) => {
    setActiveId(id)
    onNavChange?.(id)
  }

  return (
    <nav className={`navbar${collapsed ? ' navbar--collapsed' : ''}`}>
      <div className="navbar__header">
        <div className="navbar__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        {!collapsed && <span className="navbar__title">Futur Kawa</span>}
      </div>

      <ul className="navbar__menu">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`navbar__item${activeId === item.id ? ' navbar__item--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className="navbar__icon">{item.icon}</span>
              {!collapsed && <span className="navbar__label">{item.label}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar__test-section">
        {!collapsed && <h3 className="navbar__test-title">Tests</h3>}
        <button 
          className="navbar__test-btn" 
          title="Lancer les tests"
          onClick={onTestsClick}
        >
          <img src={testIcon} alt="Tests" className="navbar__test-icon" />
          {!collapsed && <span>Dashboard Tests</span>}
        </button>
      </div>

      <div className="navbar__footer">
        <button
          className="navbar__collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
          {!collapsed && <span>Réduire</span>}
        </button>
      </div>
    </nav>
  )
}
