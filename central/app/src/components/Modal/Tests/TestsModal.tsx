import { useState } from 'react'
import { Modal } from '../Modal'
import { Notification, type NotificationMessage } from '../../Notification/Notification'
import './TestsModal.css'

interface TestsModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
  onCreateLot?: () => void
}

interface LotFormData {
  id_lot: string
  pays: string
  exploitation: string
  entrepot: string
  date_stockage: string
  statut: string
}

interface MesureFormData {
  id_entrepot: string
  temperature: number
  humidite: number
}

const getCurrentDateTime = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const generateId = (): string => {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function TestsModal({ isOpen, onClose, title, children }: TestsModalProps) {
  const [formData, setFormData] = useState<LotFormData>({
    id_lot: 'LOT003',
    pays: 'Brésil',
    exploitation: 'Ferme A',
    entrepot: 'ENT01',
    date_stockage: getCurrentDateTime(),
    statut: 'conforme'
  })

  const [mesureData, setMesureData] = useState<MesureFormData>({
    id_entrepot: 'ENT01',
    temperature: 22.5,
    humidite: 65.3
  })

  const [notifications, setNotifications] = useState<NotificationMessage[]>([])

  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = generateId()
    setNotifications(prev => [...prev, { id, type, message }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMesureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMesureData(prev => ({
      ...prev,
      [name]: name === 'id_entrepot' ? value : parseFloat(value) || 0
    }))
  }

  const handleCreateLot = async () => {
    try {
      const response = await fetch('http://localhost:3001/lots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Erreur: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Lot créé avec succès:', result)
      addNotification('Lot créé avec succès!', 'success')
    } catch (error) {
      console.error('Erreur lors de la création du lot:', error)
      addNotification(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error')
    }
  }

  const handleCreateMesure = async () => {
    try {
      const response = await fetch('http://localhost:3001/mesures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mesureData),
      })

      if (!response.ok) {
        throw new Error(`Erreur: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Mesure créée avec succès:', result)
      addNotification('Mesure créée avec succès!', 'success')
    } catch (error) {
      console.error('Erreur lors de la création de la mesure:', error)
      addNotification(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error')
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        width="90%"
        height="85%"
      >
        <div className="tests-modal-content">
          {children}
          <div className="lot-form-container">
            <button className="btn-create-lot" onClick={handleCreateLot}>
              Création de lot
            </button>
            <div className="lot-form">
              <div className="form-group">
                <label>ID Lot</label>
                <input 
                  type="text" 
                  name="id_lot"
                  value={formData.id_lot}
                  onChange={handleInputChange}
                  placeholder="ID"
                />
              </div>
              <div className="form-group">
                <label>Pays</label>
                <input 
                  type="text" 
                  name="pays"
                  value={formData.pays}
                  onChange={handleInputChange}
                  placeholder="Pays"
                />
              </div>
              <div className="form-group">
                <label>Exploitation</label>
                <input 
                  type="text" 
                  name="exploitation"
                  value={formData.exploitation}
                  onChange={handleInputChange}
                  placeholder="Exploitation"
                />
              </div>
              <div className="form-group">
                <label>Entrepôt</label>
                <input 
                  type="text" 
                  name="entrepot"
                  value={formData.entrepot}
                  onChange={handleInputChange}
                  placeholder="Entrepôt"
                />
              </div>
              <div className="form-group">
                <label>Date Stockage</label>
                <input 
                  type="datetime-local" 
                  name="date_stockage"
                  value={formData.date_stockage}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select 
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                >
                  <option value="conforme">Conforme</option>
                  <option value="en alerte">En Alerte</option>
                  <option value="périmé">Périmé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mesure-form-container">
            <button className="btn-create-mesure" onClick={handleCreateMesure}>
              Création de mesure
            </button>
            <div className="mesure-form">
              <div className="form-group">
                <label>ID Entrepôt</label>
                <input 
                  type="text" 
                  name="id_entrepot"
                  value={mesureData.id_entrepot}
                  onChange={handleMesureInputChange}
                  placeholder="entrepot-1"
                />
              </div>
              <div className="form-group">
                <label>Température</label>
                <input 
                  type="number" 
                  name="temperature"
                  step="0.1"
                  value={mesureData.temperature}
                  onChange={handleMesureInputChange}
                  placeholder="22.5"
                />
              </div>
              <div className="form-group">
                <label>Humidité</label>
                <input 
                  type="number" 
                  name="humidite"
                  step="0.1"
                  value={mesureData.humidite}
                  onChange={handleMesureInputChange}
                  placeholder="65.3"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Notification notifications={notifications} onRemove={removeNotification} />
    </>
  )
}
