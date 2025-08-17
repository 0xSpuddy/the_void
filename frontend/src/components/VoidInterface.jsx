import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useShout } from '../hooks/useShout'

const VoidInterface = () => {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { shout, isLoading, error, success, isConfirmed, hash } = useShout()
  const [message, setMessage] = useState('')
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    if (error || success) {
      setShowStatus(true)
      const timer = setTimeout(() => setShowStatus(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  useEffect(() => {
    if (isConfirmed && hash) {
      setMessage('')
      setShowStatus(true)
    }
  }, [isConfirmed, hash])

  const handleShout = async () => {
    await shout(message)
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="shout-interface fade-in">
      <div className="connected-wallet">
        user@void:~$ Connected: {formatAddress(address)}
        <button 
          onClick={() => disconnect()}
          style={{
            marginLeft: '1rem',
            padding: '0.3rem 0.6rem',
            fontSize: '0.8rem',
            background: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid #ff4444',
            color: '#ff4444',
            borderRadius: '2px',
            cursor: 'pointer',
            fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace"
          }}
        >
          [disconnect]
        </button>
      </div>
      
      <textarea
        className="shout-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="> echo 'your message here' | shout_to_void"
        maxLength={500}
        disabled={isLoading}
      />
      
      <button
        className={`shout-button ${isLoading ? 'loading' : ''}`}
        onClick={handleShout}
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? 'EXECUTING...' : 'EXECUTE'}
      </button>

      {showStatus && (
        <div className="fade-in">
          {error && (
            <div className="status-message status-error">
              Error: {error}
            </div>
          )}
          
          {success && (
            <div className="status-message status-success">
              {success}
              {hash && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                  Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                  {isConfirmed && <div>✅ Confirmed!</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VoidInterface
