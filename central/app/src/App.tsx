import { useState } from 'react'
import { TestsModal } from './components/Modal/Tests/TestsModal'
import { Navbar } from './components/Navbar/Navbar'
import { Dashboard } from './page/Dashboard/Dashboard'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="app-layout">
      <Navbar
        onTestsClick={() => setIsModalOpen(true)}
        onNavChange={(id) => setActivePage(id)}
      />
      <div className="app-container">
        <TestsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
          title="Tests"
        ></TestsModal>
        {activePage === 'dashboard' && <Dashboard />}
      </div>
    </div>
  )
}

export default App
