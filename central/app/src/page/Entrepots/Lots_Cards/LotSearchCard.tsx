import { useEffect, useState } from 'react'
import { Card } from '../../../components/Card/Card'
import LotsIcon from '../../../assets/icon/lots.svg?react'
import SearchIcon from '../../../assets/icon/search.svg?react'
import { useDashboardContext } from '../../../context/DashboardContext'
import './LotSearchCard.css'

interface Lot {
  id_lot: string
  exploitation: string
  date_stockage: string
}

const COUNTRY_SLUGS: Record<string, string> = {
  'Brésil': 'brazil',
  'Colombie': 'colombia',
}

export function LotSearchCard({ className }: { className?: string }) {
  const { selectedZoneId } = useDashboardContext()
  const [lots, setLots] = useState<Lot[]>([])
  const [error, setError] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => { handleLotChange('') }, [selectedZoneId])

  const handleLotChange = async (value: string) => {
    const countrySlug = selectedZoneId ? COUNTRY_SLUGS[selectedZoneId] : null
    if (!countrySlug) { setLots([]); setError(false); return }

    const url = value.trim()
      ? `http://localhost:3001/${countrySlug}/lots/${encodeURIComponent(value)}`
      : `http://localhost:3001/${countrySlug}/lots`
    const response = await fetch(url)
    if (!response.ok) { console.error('Erreur lors de la récupération du lot'); setLots([]); setError(true); return }
    const data = await response.json()
    setLots(value.trim() ? [data] : data)
    setError(false)
  }

  return (
    <Card className={className} content={
      <div className="lot-search-card__content">
        <div className="lot-search-card__input-wrapper">
          <input
            className="lot-search-card__input"
            type="text"
            placeholder="Lots"
            onChange={(e) => handleLotChange(e.target.value)}
          />
          <SearchIcon className="lot-search-card__input-icon" />
        </div>
        {error && (
          <p className="lot-search-card__error">Lot introuvable</p>
        )}
        <div className="lot-search-card__list">
          {lots.map((lot) => (
            <button
              key={lot.id_lot}
              className={`lot-search-card__btn${selectedId === lot.id_lot ? ' lot-search-card__btn--active' : ''}`}
              onClick={() => setSelectedId(lot.id_lot === selectedId ? null : lot.id_lot)}
            >
              <span>{lot.id_lot} {lot.exploitation} {new Date(lot.date_stockage).toLocaleDateString('fr-FR')}</span>
              <LotsIcon className="lot-search-card__btn-icon" />
            </button>
          ))}
        </div>
      </div>
    } />
  )
}
