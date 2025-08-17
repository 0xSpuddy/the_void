import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { config } from './config/web3'
import VoidInterface from './components/VoidInterface'
import VoidViewer from './components/VoidViewer'

const queryClient = new QueryClient()

const ConnectWallet = () => {
  const { connectors, connect, isPending } = useConnect()
  
  return (
    <div className="fade-in">
      <p style={{ 
        textAlign: 'left', 
        fontSize: '1rem', 
        marginBottom: '1.5rem',
        color: '#00ff00',
        fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
        textShadow: '0 0 8px #00ff00'
      }}>
        {'>'} Requesting permission to know your Ethereum name...
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="peek-button"
            style={{ fontSize: '1.2rem', padding: '0.8rem 2rem' }}
          >
            {isPending ? 'Connecting...' : `Connect ${connector.name}`}
          </button>
        ))}
      </div>
    </div>
  )
}

const VoidApp = () => {
  const { isConnected } = useAccount()
  const [hasClicked, setHasClicked] = useState(false)
  const [currentView, setCurrentView] = useState('interface') // 'interface' or 'viewer'

  const handlePeekClick = () => {
    setHasClicked(true)
  }

  const switchToViewer = () => {
    setCurrentView('viewer')
  }

  const switchToInterface = () => {
    setCurrentView('interface')
  }

  return (
    <>
      <div className="void-background"></div>
      <div className="container">

        
        {!isConnected && !hasClicked && (
          <button className="peek-button" onClick={handlePeekClick}>
            ./interface_with_void
          </button>
        )}

        {!isConnected && hasClicked && (
          <ConnectWallet />
        )}

        {isConnected && currentView === 'interface' && (
          <VoidInterface onViewVoid={switchToViewer} />
        )}

        {isConnected && currentView === 'viewer' && (
          <VoidViewer onBack={switchToInterface} />
        )}
      </div>
    </>
  )
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <VoidApp />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
