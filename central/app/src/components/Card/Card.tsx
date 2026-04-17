import './Card.css'

interface CardProps {
  title?: string
  content: React.ReactNode
  className?: string
}

export function Card({ title, content, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && <h1 className="card__title">{title}</h1>}
      <div className="card__content">
        {content}
      </div>
    </div>
  )
}
