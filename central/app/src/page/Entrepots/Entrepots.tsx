import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/Card/Card'
import { PaysCard } from '../../components/Card/Pays/PaysCard'
import { ExploitationSelector, COUNTRY_MAPPING } from '../../components/Card/ExploitationCard/ExploitationSelector'
import { LotSearchCard } from './Lots_Cards/LotSearchCard'
import { useDashboardContext } from '../../context/DashboardContext'
import './Entrepots.css'

interface Exploitation {
  id_exploitation: number
  nom: string
}

interface Entrepot {
  id_entrepot: number
  id_exploitation: number | null
  nom: string
}

interface Mesure {
  id_mesure: number
  temperature: number | null
  humidite: number | null
  statut: string | null
  timestamp: string
}

interface EntrepotMeta {
  temperature: number | null
  humidite: number | null
  statut: string | null
  timestamp: string | null
}

type StatusFilter = 'all' | 'alert' | 'ok'

const formatMetric = (value: number | null, unit: string, digits = 1) => {
  if (value === null || Number.isNaN(value)) return '--'
  return `${value.toFixed(digits)}${unit}`
}

const formatTimestamp = (value: string | null) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusLabel = (status?: string | null) => {
  if (!status) return 'Inconnu'
  return status === 'en alerte' ? 'En alerte' : 'Conforme'
}

export function Entrepots() {
  const { selectedZoneId } = useDashboardContext()
  const [selectedExploitation, setSelectedExploitation] = useState<Exploitation | null>(null)
  const [entrepots, setEntrepots] = useState<Entrepot[]>([])
  const [entrepotMeta, setEntrepotMeta] = useState<Record<number, EntrepotMeta>>({})
  const [selectedEntrepotId, setSelectedEntrepotId] = useState<number | null>(null)
  const [lotsCount, setLotsCount] = useState<number | null>(null)
  const [mesures, setMesures] = useState<Mesure[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loadingEntrepots, setLoadingEntrepots] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [errorEntrepots, setErrorEntrepots] = useState<string | null>(null)

  const countryCode = selectedZoneId ? COUNTRY_MAPPING[selectedZoneId] : undefined
  const apiBase = countryCode ? `http://localhost:3001/${countryCode}` : null

  useEffect(() => {
    if (!apiBase) {
      setEntrepots([])
      setSelectedEntrepotId(null)
      setEntrepotMeta({})
      setErrorEntrepots(null)
      return
    }

    const controller = new AbortController()
    const fetchEntrepots = async () => {
      try {
        setLoadingEntrepots(true)
        setErrorEntrepots(null)
        const url = selectedExploitation?.id_exploitation
          ? `${apiBase}/entrepots/exploitation/${selectedExploitation.id_exploitation}`
          : `${apiBase}/entrepots`
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Impossible de charger les entrepôts')
        const data: Entrepot[] = await response.json()
        setEntrepots(data)
        setSelectedEntrepotId((previous) =>
          data.some((entrepot) => entrepot.id_entrepot === previous)
            ? previous
            : data[0]?.id_entrepot ?? null,
        )
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setEntrepots([])
        setSelectedEntrepotId(null)
        setErrorEntrepots('Aucun entrepôt disponible')
      } finally {
        setLoadingEntrepots(false)
      }
    }

    fetchEntrepots()
    return () => controller.abort()
  }, [apiBase, selectedExploitation?.id_exploitation])

  useEffect(() => {
    if (!apiBase || entrepots.length === 0) {
      setEntrepotMeta({})
      return
    }

    let isActive = true

    const fetchMeta = async () => {
      const entries = await Promise.all(
        entrepots.map(async (entrepot) => {
          try {
            const response = await fetch(`${apiBase}/mesures/entrepot/${entrepot.id_entrepot}/latest`)
            if (!response.ok) throw new Error('No data')
            const data = await response.json()
            return [
              entrepot.id_entrepot,
              {
                temperature: typeof data.temperature === 'number' ? data.temperature : null,
                humidite: typeof data.humidite === 'number' ? data.humidite : null,
                statut: data.statut ?? null,
                timestamp: data.timestamp ?? null
              }
            ] as const
          } catch {
            return [
              entrepot.id_entrepot,
              { temperature: null, humidite: null, statut: null, timestamp: null }
            ] as const
          }
        }),
      )

      if (!isActive) return
      setEntrepotMeta(Object.fromEntries(entries))
    }

    fetchMeta()
    return () => {
      isActive = false
    }
  }, [apiBase, entrepots])

  useEffect(() => {
    if (!apiBase || !selectedEntrepotId) {
      setLotsCount(null)
      setMesures([])
      return
    }

    const controller = new AbortController()
    const fetchDetails = async () => {
      try {
        setLoadingDetails(true)
        const [lotsRes, mesuresRes] = await Promise.all([
          fetch(`${apiBase}/lots/entrepot/${selectedEntrepotId}`, { signal: controller.signal }),
          fetch(`${apiBase}/mesures/entrepot/${selectedEntrepotId}`, { signal: controller.signal })
        ])

        if (lotsRes.ok) {
          const lots = await lotsRes.json()
          setLotsCount(Array.isArray(lots) ? lots.length : null)
        } else {
          setLotsCount(null)
        }

        if (mesuresRes.ok) {
          const data: Mesure[] = await mesuresRes.json()
          setMesures(Array.isArray(data) ? data.slice(0, 6) : [])
        } else {
          setMesures([])
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        setLotsCount(null)
        setMesures([])
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchDetails()
    return () => controller.abort()
  }, [apiBase, selectedEntrepotId])

  const filteredEntrepots = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return entrepots.filter((entrepot) => {
      const matchesSearch =
        !term ||
        entrepot.nom?.toLowerCase().includes(term) ||
        String(entrepot.id_entrepot).includes(term)

      if (!matchesSearch) return false

      if (statusFilter === 'all') return true
      const meta = entrepotMeta[entrepot.id_entrepot]
      if (!meta?.statut) return false

      return statusFilter === 'alert'
        ? meta.statut === 'en alerte'
        : meta.statut === 'conforme'
    })
  }, [entrepots, entrepotMeta, searchTerm, statusFilter])

  const selectedEntrepot = entrepots.find((entrepot) => entrepot.id_entrepot === selectedEntrepotId) || null
  const selectedMeta = selectedEntrepotId ? entrepotMeta[selectedEntrepotId] : undefined

  const metaValues = entrepots
    .map((entrepot) => entrepotMeta[entrepot.id_entrepot])
    .filter((meta): meta is EntrepotMeta => Boolean(meta))

  const alertCount = metaValues.filter((meta) => meta.statut === 'en alerte').length
  const okCount = metaValues.filter((meta) => meta.statut === 'conforme').length

  const averageValue = (values: Array<number | null>) => {
    const valid = values.filter((value): value is number => typeof value === 'number')
    if (!valid.length) return null
    return valid.reduce((sum, value) => sum + value, 0) / valid.length
  }

  const avgTemperature = averageValue(metaValues.map((meta) => meta.temperature))
  const avgHumidite = averageValue(metaValues.map((meta) => meta.humidite))

  const latestUpdate = metaValues
    .map((meta) => meta.timestamp)
    .filter((timestamp): timestamp is string => Boolean(timestamp))
    .reduce<string | null>((latest, current) => {
      if (!latest) return current
      return new Date(current).getTime() > new Date(latest).getTime() ? current : latest
    }, null)

  return (
    <main className="entrepots-page">
      <aside className="entrepots-sidebar">
        <PaysCard className="entrepots-sidebar__card" />
        <ExploitationSelector
          selectedZoneId={selectedZoneId}
          onSelectExploitation={setSelectedExploitation}
          className="entrepots-sidebar__card"
        />
        <LotSearchCard className="entrepots-sidebar__card entrepots-sidebar__lot-search" />
        <Card
          className="entrepots-filters"
          content={
            <div className="entrepots-filters__content">
              <div className="entrepots-filters__field">
                <span className="entrepots-filters__label">Recherche</span>
                <input
                  className="entrepots-filters__input"
                  placeholder="Nom ou ID de l'entrepôt"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="entrepots-filters__row">
                <button
                  className={`entrepots-filter-chip${statusFilter === 'all' ? ' is-active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  Tous
                </button>
                <button
                  className={`entrepots-filter-chip${statusFilter === 'alert' ? ' is-active' : ''}`}
                  onClick={() => setStatusFilter('alert')}
                >
                  En alerte
                </button>
                <button
                  className={`entrepots-filter-chip${statusFilter === 'ok' ? ' is-active' : ''}`}
                  onClick={() => setStatusFilter('ok')}
                >
                  Conforme
                </button>
              </div>
              <div className="entrepots-mini-stats">
                <div>
                  <span>Total</span>
                  <strong>{entrepots.length}</strong>
                </div>
                <div>
                  <span>Alertes</span>
                  <strong>{alertCount}</strong>
                </div>
                <div>
                  <span>OK</span>
                  <strong>{okCount}</strong>
                </div>
              </div>
            </div>
          }
        />
      </aside>

      <section className="entrepots-content">
        <Card
          className="entrepots-hero"
          content={
            <div className="entrepots-hero__content">
              <div className="entrepots-hero__text">
                <p className="entrepots-hero__eyebrow">Entrepôts</p>
                <h1 className="entrepots-hero__title">Pilotage intelligent des stocks</h1>
                <p className="entrepots-hero__subtitle">
                  Exploitation :{' '}
                  <span className="gradient-exploitation">
                    {selectedExploitation?.nom ?? 'Sélectionnez une exploitation'}
                  </span>
                </p>
                <div className="entrepots-hero__meta">
                  <span className="entrepots-chip">
                    Pays : {selectedZoneId ?? 'Non sélectionné'}
                  </span>
                  <span className="entrepots-chip">
                    Entrepôts : {entrepots.length}
                  </span>
                  <span className={`entrepots-chip ${alertCount > 0 ? 'is-alert' : 'is-ok'}`}>
                    Alertes : {alertCount}
                  </span>
                </div>
              </div>
              <div className="entrepots-hero__stats">
                <div className="entrepots-stat gradient-entrepots-bg">
                  <span>Temp. moyenne</span>
                  <strong>{formatMetric(avgTemperature, '°C')}</strong>
                </div>
                <div className="entrepots-stat entrepots-stat--soft">
                  <span>Humidité moyenne</span>
                  <strong>{formatMetric(avgHumidite, '%')}</strong>
                </div>
                <div className="entrepots-stat entrepots-stat--outline">
                  <span>Dernière MAJ</span>
                  <strong>{formatTimestamp(latestUpdate)}</strong>
                </div>
              </div>
            </div>
          }
        />

        <div className="entrepots-grid">
          <Card
            className="entrepots-list-card"
            content={
              <div className="entrepots-list">
                <div className="entrepots-list__header">
                  <h2>Carte des entrepôts</h2>
                  <span>{filteredEntrepots.length} visibles</span>
                </div>
                {loadingEntrepots && (
                  <p className="entrepots-list__state">Chargement des entrepôts...</p>
                )}
                {!loadingEntrepots && errorEntrepots && (
                  <p className="entrepots-list__state entrepots-list__state--error">{errorEntrepots}</p>
                )}
                {!loadingEntrepots && !errorEntrepots && filteredEntrepots.length === 0 && (
                  <p className="entrepots-list__state">Aucun entrepôt ne correspond à votre filtre.</p>
                )}
                <div className="entrepots-list__items">
                  {filteredEntrepots.map((entrepot) => {
                    const meta = entrepotMeta[entrepot.id_entrepot]
                    const status = statusLabel(meta?.statut)
                    const statusClass = meta?.statut === 'en alerte'
                      ? 'is-alert'
                      : meta?.statut === 'conforme'
                        ? 'is-ok'
                        : 'is-muted'

                    return (
                      <button
                        key={entrepot.id_entrepot}
                        className={`entrepots-list__item${selectedEntrepotId === entrepot.id_entrepot ? ' is-active' : ''}`}
                        onClick={() => setSelectedEntrepotId(entrepot.id_entrepot)}
                      >
                        <div className="entrepots-list__info">
                          <span className="entrepots-list__name">{entrepot.nom || `Entrepôt #${entrepot.id_entrepot}`}</span>
                          <span className="entrepots-list__sub">ID {entrepot.id_entrepot}</span>
                        </div>
                        <div className="entrepots-list__meta">
                          <span className={`entrepots-status ${statusClass}`}>{status}</span>
                          <span className="entrepots-list__temp">
                            {formatMetric(meta?.temperature ?? null, '°C', 1)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            }
          />

          <div className="entrepots-detail">
            <Card
              className="entrepots-detail-card"
              content={
                <div className="entrepots-detail__content">
                  <div className="entrepots-detail__header">
                    <div>
                      <span className="entrepots-detail__label">Entrepôt</span>
                      <h2 className="entrepots-detail__name">
                        {selectedEntrepot?.nom || 'Sélectionnez un entrepôt'}
                      </h2>
                      <p className="entrepots-detail__exploitation">
                        Exploitation :{' '}
                        <span className="gradient-exploitation">
                          {selectedExploitation?.nom ?? '---'}
                        </span>
                      </p>
                    </div>
                    <span className={`entrepots-status entrepots-status--large ${selectedMeta?.statut === 'en alerte' ? 'is-alert' : selectedMeta?.statut === 'conforme' ? 'is-ok' : 'is-muted'}`}>
                      {statusLabel(selectedMeta?.statut)}
                    </span>
                  </div>
                  <div className="entrepots-metrics">
                    <div className="entrepots-metric">
                      <span>Lots</span>
                      <strong>{lotsCount ?? '--'}</strong>
                    </div>
                    <div className="entrepots-metric">
                      <span>Température</span>
                      <strong>{formatMetric(selectedMeta?.temperature ?? null, '°C')}</strong>
                    </div>
                    <div className="entrepots-metric">
                      <span>Humidité</span>
                      <strong>{formatMetric(selectedMeta?.humidite ?? null, '%')}</strong>
                    </div>
                    <div className="entrepots-metric">
                      <span>Dernière mesure</span>
                      <strong>{formatTimestamp(selectedMeta?.timestamp ?? null)}</strong>
                    </div>
                  </div>
                </div>
              }
            />

            <Card
              className="entrepots-activity-card"
              content={
                <div className="entrepots-activity">
                  <div className="entrepots-activity__header">
                    <h3>Historique récent</h3>
                    <span>{loadingDetails ? 'Chargement...' : `${mesures.length} mesures`}</span>
                  </div>
                  {selectedEntrepotId === null && (
                    <p className="entrepots-activity__state">Choisissez un entrepôt pour afficher les mesures.</p>
                  )}
                  {selectedEntrepotId !== null && mesures.length === 0 && !loadingDetails && (
                    <p className="entrepots-activity__state">Aucune mesure enregistrée.</p>
                  )}
                  <div className="entrepots-activity__list">
                    {mesures.map((mesure) => (
                      <div key={mesure.id_mesure} className="entrepots-activity__row">
                        <div>
                          <span className="entrepots-activity__title">{formatTimestamp(mesure.timestamp)}</span>
                          <span className="entrepots-activity__subtitle">
                            Temp : {formatMetric(mesure.temperature ?? null, '°C')} · Humidité : {formatMetric(mesure.humidite ?? null, '%')}
                          </span>
                        </div>
                        <span
                          className={`entrepots-status ${
                            mesure.statut === 'en alerte'
                              ? 'is-alert'
                              : mesure.statut === 'conforme'
                                ? 'is-ok'
                                : 'is-muted'
                          }`}
                        >
                          {statusLabel(mesure.statut)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>
    </main>
  )
}
