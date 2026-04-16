import { useState } from 'react'
import { TestsModal } from './components/Modal/Tests/TestsModal'
import { Navbar } from './components/Navbar/Navbar'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="app-layout">
      <Navbar onTestsClick={() => setIsModalOpen(true)} />
      <div className="app-container">
        <TestsModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Tests"
        >
        </TestsModal>
      </div>
    </div>
  )
}

export default App
