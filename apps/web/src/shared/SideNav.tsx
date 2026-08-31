import { useState } from 'react'
import './SideNav.css'
import type { PageKey } from '../types'

// The left-hand navigation menu shown on every page once the user is signed
// in. `active` tells it which item to highlight, and `onNavigate` is called
// whenever the user clicks a different item.

interface NavItem {
  key: PageKey
  label: string
  icon?: string
}

// The menu items, in the order they should appear. `icon` is a Font Awesome
// class name and is optional (a couple of items don't have one).
const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home / Today', icon: 'fa-solid fa-house' },
  { key: 'calendar', label: 'Calendar', icon: 'fa-regular fa-calendar' },
  { key: 'runs', label: 'Runs', icon: 'fa-solid fa-person-running' },
  { key: 'lifting', label: 'Lifting Workouts', icon: 'fa-solid fa-dumbbell' },
  { key: 'exercises', label: 'Exercise List', icon: 'fa-solid fa-list' },
  { key: 'account', label: 'Account', icon: 'fa-regular fa-circle-user' },
]

interface SideNavProps {
  active: PageKey
  onNavigate: (page: PageKey) => void
}

function SideNav({ active, onNavigate }: SideNavProps) {
  // On mobile the item list becomes a dropdown, opened via the hamburger
  // button in the top bar - closed again as soon as an item is picked.
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSelect(page: PageKey) {
    onNavigate(page)
    setMenuOpen(false)
  }

  return (
    <nav className={`side-nav ${menuOpen ? 'menu-open' : ''}`}>
      <div className="side-nav-header">
        <div className="side-nav-brand">
          <span className="side-nav-brand-title">Hybrid Basics</span>
          <span className="side-nav-brand-subtitle">The App For Beginner Hybrid Athletes</span>
        </div>
        <button
          type="button"
          className="side-nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
        >
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>
      <ul className="side-nav-items">
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`nav-link ${active === item.key ? 'active' : ''}`}
              onClick={() => handleSelect(item.key)}
            >
              {item.icon && <i className={`${item.icon} nav-icon`}></i>}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default SideNav
