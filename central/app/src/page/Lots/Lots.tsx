import { Card } from '../../components/Card/Card'
import { PaysCard } from '../../components/Card/Pays/PaysCard'
import './Lots.css'

export function Lots() {
  return (
    <main className="lots">
      <div className="lots__top-bar">
        <div className="lots__left-column">
          <PaysCard className="lots__card-pays" />
          <Card className="lots__card-below-pays" content={
            <input
              className="lots__input"
              type="text"
              placeholder="Lots"
            />
          } />
        </div>
        <Card className="lots__card-main" content={null} />
      </div>
    </main>
  )
}
