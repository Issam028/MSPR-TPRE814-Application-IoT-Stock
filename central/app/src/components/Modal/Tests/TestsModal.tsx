import { useState } from 'react'
import { Modal } from '../Modal'
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

export function TestsModal({ isOpen, onClose, title, children, onCreateLot }: TestsModalProps) {
  const [formData, setFormData] = useState<LotFormData>({
    id_lot: '',
    pays: '',
    exploitation: '',
    entrepot: '',
    date_stockage: '',
    statut: 'conforme'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
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
          <button className="btn-create-lot" onClick={onCreateLot}>
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
      </div>
    </Modal>
  )
}
