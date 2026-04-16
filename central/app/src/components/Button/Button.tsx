import './Button.css'

interface ButtonProps {
  label: string
  onClick?: () => void
  icon?: string | React.ReactNode
}

export function Button({ label, onClick, icon }: ButtonProps) {
  return (
    <button className="btn-flat" onClick={onClick}>
      {icon && (
        <span className="btn-icon">
          {typeof icon === 'string' && (icon.includes('/') || icon.includes('.')) ? (
            <img src={icon as string} alt={label} />
          ) : (
            icon
          )}
        </span>
      )}
      {label}
    </button>
  )
}
