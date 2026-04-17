import { useEffect, useRef, useState } from 'react'
import Map1 from '../../assets/map1.svg?react'
import { Card } from '../../components/Card/Card'
import './Dashboard.css'

export function Dashboard() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    const ALLOWED_ZONES = ['zone-4', 'zone-5', 'zone-6']
    const ZONE_NAMES: { [key: string]: string } = {
      'zone-4': 'Brésil',
      'zone-5': 'Colombie',
      'zone-6': 'Équateur'
    }

    // Générer des IDs automatiques pour chaque path
    const paths = container.querySelectorAll('path')
    paths.forEach((path, index) => {
      if (!path.id) {
        path.id = `zone-${index + 1}`
      }
      // Ajouter une classe selon si la zone est autorisée
      if (ALLOWED_ZONES.includes(path.id)) {
        path.classList.add('interactive')
      } else {
        path.classList.add('non-interactive')
      }
    })

    // Détecteur de clic sur les zones
    const handlePathClick = (event: Event) => {
      const target = event.target as SVGElement

      if (target.tagName === 'path') {
        const path = target as SVGPathElement
        const zoneId = path.id || `zone-${Array.from(paths).indexOf(path) + 1}`

        // Vérifier que la zone est autorisée
        if (!ALLOWED_ZONES.includes(zoneId)) {
          return
        }

        // Retirer la classe selected de tous les paths
        paths.forEach(p => p.classList.remove('selected'))

        // Ajouter la classe selected au path cliqué
        path.classList.add('selected')
        const zoneName = ZONE_NAMES[zoneId] || zoneId
        setSelectedZoneId(zoneName)

        console.log(`Zone cliquée: ${zoneName} (${zoneId})`)
      }
    }

    container.addEventListener('click', handlePathClick as EventListener)

    return () => {
      container.removeEventListener('click', handlePathClick as EventListener)
    }
  }, [])

  return (
    <main className="dashboard">
      <Card 
        className="dashboard__card-top-left"
        content={
          selectedZoneId ? (
            <div>
              <p style={{
                margin: 0,
                background: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold'
              }}>
                Pays : {selectedZoneId}
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                Cliquez sur un pays pour le sélectionner.
              </p>
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>Aucun pays sélectionné</p>
          )
        }
      />
      <div className="dashboard__map-wrapper">
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="map-hover-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#1e3a8a" />
              <stop offset="60%"  stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
        <div ref={mapContainerRef}>
          <Map1 className="dashboard__map" />
        </div>
      </div>
    </main>
  )
}
