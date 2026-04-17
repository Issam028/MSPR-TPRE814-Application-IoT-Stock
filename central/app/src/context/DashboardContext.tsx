import { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardContextType {
  selectedZoneId: string | null
  setSelectedZoneId: (zoneId: string | null) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  return (
    <DashboardContext.Provider value={{ selectedZoneId, setSelectedZoneId }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return context
}
