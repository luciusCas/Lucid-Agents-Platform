import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Marketplace from './pages/Marketplace'
import AgentDetail from './pages/AgentDetail'
import AgentManagement from './pages/AgentManagement'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/agent/:agentId" element={<AgentDetail />} />
        <Route path="/manage-agents" element={<AgentManagement />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
