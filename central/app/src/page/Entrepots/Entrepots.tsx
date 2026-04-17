import { Card } from '../../components/Card/Card'
import { PaysCard } from '../../components/Card/Pays/PaysCard'
import { LotSearchCard } from './Lots_Cards/LotSearchCard'
import './Entrepots.css'

export function Entrepots() {
  return (
    <main className="lots">
      <div className="lots__top-bar">
        <div className="lots__left-column">
          <PaysCard className="lots__card-pays" />
          <LotSearchCard className="lots__card-below-pays" />
        </div>
        <Card className="lots__card-main" content={null} />
      </div>
    </main>
  )
}
