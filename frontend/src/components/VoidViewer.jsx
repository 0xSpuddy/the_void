import { useState, useEffect, useRef } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useVoidData } from '../hooks/useVoidData'

const VoidViewer = ({ onBack }) => {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { shouts, isLoading, error, hasMore, fetchNextShout, clearCache, totalShouts } = useVoidData()
  const [autoScroll, setAutoScroll] = useState(true)
  const [showingCount, setShowingCount] = useState(10)
  const scrollContainerRef = useRef(null)

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatRelativeTime = (timestamp) => {
    const now = Date.now() / 1000
    const diff = now - timestamp
    
    if (diff < 60) return `${Math.floor(diff)}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  // Auto-scroll to bottom when new shouts arrive (if enabled)
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [shouts, autoScroll])

  const handleLoadMore = () => {
    const newCount = Math.min(showingCount + 10, totalShouts)
    setShowingCount(newCount)
    
    // If we're showing all available shouts and there might be more, fetch them
    if (newCount === totalShouts && hasMore) {
      fetchNextShout()
    }
  }

  const displayedShouts = shouts.slice(0, showingCount)

  return (
    <div className="void-viewer fade-in">
      {/* Header */}
      <div className="void-header">
        <div className="void-title">
          <div className="terminal-prompt">root@void:~$ cat /dev/null/echoes</div>
          <div className="void-subtitle">Listening to the whispers in the darkness...</div>
        </div>
        
        <div className="void-controls">
          <div className="connection-info">
            Connected: {formatAddress(address)}
            <button 
              onClick={() => disconnect()}
              className="disconnect-btn"
            >
              [disconnect]
            </button>
          </div>
          
          <div className="control-buttons">
            <button onClick={onBack} className="nav-button">
              ← Back to Interface
            </button>
            <button 
              onClick={clearCache} 
              className="clear-button"
              disabled={isLoading}
            >
              Clear Cache
            </button>
            <button 
              onClick={fetchNextShout} 
              className="fetch-button"
              disabled={isLoading || !hasMore}
            >
              {isLoading ? 'Loading...' : 'Fetch More'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="void-stats">
        <span>Total Echoes Found: {totalShouts}</span>
        <span>Displaying: {displayedShouts.length}</span>
        <span>Status: {hasMore ? 'More available' : 'All echoes loaded'}</span>
        <label className="auto-scroll-toggle">
          <input 
            type="checkbox" 
            checked={autoScroll} 
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          ERROR: {error}
        </div>
      )}

      {/* Shouts Display */}
      <div className="void-container" ref={scrollContainerRef}>
        {displayedShouts.length === 0 && !isLoading ? (
          <div className="empty-void">
            <div className="empty-message">
              The void is silent... No echoes have been captured yet.
            </div>
            <button onClick={fetchNextShout} className="start-listening">
              Start Listening →
            </button>
          </div>
        ) : (
          <div className="shouts-list">
            {displayedShouts.map((shout, index) => (
              <div key={shout.id} className="shout-entry">
                <div className="shout-header">
                  <span className="shout-index">[{index + 1}]</span>
                  <span className="shout-timestamp">
                    {formatTimestamp(shout.timestamp)}
                  </span>
                  <span className="shout-relative">
                    ({formatRelativeTime(shout.timestamp)})
                  </span>
                </div>
                <div className="shout-content">
                  <div className="prompt-line">{'>'} echo from the void:</div>
                  <div className="shout-message">"{shout.message}"</div>
                </div>
                <div className="shout-meta">
                  timestamp: {shout.timestamp} | bytes: {shout.valueHex.length > 20 ? `${shout.valueHex.substring(0, 20)}...` : shout.valueHex}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="loading-entry">
                <div className="loading-text">
                  ► Listening for more echoes...
                </div>
                <div className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            
            {/* Load more button */}
            {(showingCount < totalShouts || hasMore) && !isLoading && (
              <div className="load-more-container">
                <button onClick={handleLoadMore} className="load-more-button">
                  {showingCount < totalShouts 
                    ? `Show More (${totalShouts - showingCount} hidden)`
                    : hasMore 
                      ? 'Fetch Older Echoes'
                      : 'All Echoes Loaded'
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VoidViewer
