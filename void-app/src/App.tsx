import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { MainPage } from './components/MainPage'
import './App.css'

function App() {
  const [isENSVerified, setIsENSVerified] = useState(false)

  const handleENSVerified = () => {
    setIsENSVerified(true)
  }

  return (
    <div className="app">
      {!isENSVerified ? (
        <LandingPage onENSVerified={handleENSVerified} />
      ) : (
        <MainPage />
      )}
    </div>
  )
}

export default App
