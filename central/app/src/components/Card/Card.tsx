import './Card.css'

interface CardProps {
  title?: string
  content: React.ReactNode
  className?: string
}

export function Card({ content, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      <div className="card__content">
        {content}
      </div>
    </div>
  )
}
