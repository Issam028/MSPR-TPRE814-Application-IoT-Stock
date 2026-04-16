import './Modal.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  width?: string
  height?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, width = '80%', height = '80%', children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          height,
          maxWidth: 'none',
          maxHeight: 'none'
        }}
      >
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
