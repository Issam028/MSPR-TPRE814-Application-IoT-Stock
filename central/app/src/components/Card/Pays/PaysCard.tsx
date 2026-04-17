import { useDashboardContext } from '../../../context/DashboardContext'
import '../Card.css'

interface PaysCardProps {
  className?: string
}

export function PaysCard({ className = '' }: PaysCardProps) {
  const { selectedZoneId } = useDashboardContext()

  return (
    <div className={`card ${className}`}>
      <div className="card__content">
        {selectedZoneId ? (
          <div>
            <p className="gradient-text--country">
              Pays : {selectedZoneId}
            </p>
          </div>
        ) : (
          <p style={{ color: '#94a3b8' }}>Aucun pays sélectionné</p>
        )}
      </div>
    </div>
  )
}
