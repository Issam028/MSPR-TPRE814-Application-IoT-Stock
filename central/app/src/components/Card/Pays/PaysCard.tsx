import { useState, useRef, useEffect } from 'react'
import { useDashboardContext } from '../../../context/DashboardContext'
import '../Card.css'
import './PaysCards.css'

interface PaysCardProps {
  className?: string
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

const COUNTRIES = ['Brésil', 'Colombie', 'Équateur']

export function PaysCard({ className = '' }: PaysCardProps) {
  const { selectedZoneId, setSelectedZoneId } = useDashboardContext()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSelectCountry = (country: string) => {
    setSelectedZoneId(country)
    setIsOpen(false)
  }

  const handleToggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      })
    }
    setIsOpen(!isOpen)
  }

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <div className={`pays-card__wrapper ${className}`} ref={buttonRef}>
        <div className="card">
          <div 
            className="card__content pays-card__content"
            onClick={handleToggleDropdown}
          >
            <p className="pays-card__text">
              {selectedZoneId ? `Pays : ${selectedZoneId}` : 'Sélectionner un pays'}
            </p>
            <svg 
              className={`pays-card__chevron ${isOpen ? 'pays-card__chevron--open' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1e3a8a" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="pays-card__dropdown card"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`
          }}
        >
          {COUNTRIES.map(country => (
            <div
              key={country}
              className={`pays-card__option ${selectedZoneId === country ? 'pays-card__option--selected' : ''}`}
              onClick={() => handleSelectCountry(country)}
            >
              {country}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
