import { useEffect, useRef } from 'react'
import Map1 from '../../assets/map1.svg?react'
import { Card } from '../../components/Card/Card'
import { PaysCard } from '../../components/Card/Pays/PaysCard'
import { useDashboardContext } from '../../context/DashboardContext'
import './Dashboard.css'

export function Dashboard() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const { selectedZoneId, setSelectedZoneId } = useDashboardContext()

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

    // Retirer la classe selected de tous les paths avant de restaurer la sélection
    paths.forEach(p => p.classList.remove('selected'))

    // Restaurer la classe selected si une zone est déjà sélectionnée
    if (selectedZoneId) {
      // Chercher la zone correspondante
      const selectedZoneKey = Object.keys(ZONE_NAMES).find(key => ZONE_NAMES[key] === selectedZoneId)
      if (selectedZoneKey) {
        const pathIndex = parseInt(selectedZoneKey.split('-')[1]) - 1
        if (paths[pathIndex]) {
          paths[pathIndex].classList.add('selected')
        }
      }
    }

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
  }, [selectedZoneId, setSelectedZoneId])

  return (
    <main className="dashboard">
      <PaysCard className="dashboard__card-top-left" />
      <Card 
        className="dashboard__card-top-right"
        content={
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>
              Lots
            </p>
            <p className="gradient-text" style={{ fontSize: '48px', margin: 0, lineHeight: 1 }}>
              148
            </p>
          </div>
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
