import { useState } from 'react'
import { Button } from './components/Button/Button'
import { TestsModal } from './components/Modal/Tests/TestsModal'
import testIcon from './assets/icon/tests.png'
import './App.css'

async function getLots() {
  const response = await fetch('http://localhost:3001/lots')
  const data = await response.json()
  console.log(data)
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="app-container">
      <div className="btn-bottom-left">
        <Button 
          label="Tests" 
          icon={testIcon} 
          onClick={() => setIsModalOpen(true)} 
        />
      </div>
      <TestsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tests"
      >
      </TestsModal>
    </div>
  )
}

export default App
