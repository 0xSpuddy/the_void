import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useVoidData } from '../hooks/useVoidData'

const TextBlob = ({ onShowInterface }) => {
  const { isConnected, address } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { shouts, isLoading, error, fetchNextShout } = useVoidData()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const [positions, setPositions] = useState([])
  const [showConnectOptions, setShowConnectOptions] = useState(false)

  // Auto-start fetching data when wallet is connected
  useEffect(() => {
    if (isConnected) {
      fetchNextShout()
    }
  }, [isConnected])

  // Generate grid-based positions for text elements with collision detection
  useEffect(() => {
    if (shouts.length === 0) return

    const newPositions = []
    const centerX = 50 // percentage
    const centerY = 50 // percentage
    const minDistance = 12 // minimum distance between elements (percentage)
    const gridSize = 8 // grid spacing for placement attempts
    
    // Track occupied areas to prevent overlap
    const occupiedAreas = []
    
    const isPositionValid = (x, y, size = minDistance) => {
      // Check boundaries
      if (x - size/2 < 5 || x + size/2 > 95 || y - size/2 < 5 || y + size/2 > 95) {
        return false
      }
      
      // Check collision with existing elements
      return !occupiedAreas.some(area => {
        const dx = Math.abs(x - area.x)
        const dy = Math.abs(y - area.y)
        return dx < (size + area.size) / 2 && dy < (size + area.size) / 2
      })
    }
    
    shouts.forEach((shout, index) => {
      let position = null
      
      if (index === 0) {
        // First item at center
        position = { x: centerX, y: centerY }
      } else {
        // Try spiral placement first
        for (let attempt = 0; attempt < 50; attempt++) {
          const spiralRadius = Math.sqrt(index + attempt * 0.5) * 6
          const angle = (index + attempt * 0.3) * 0.618 * Math.PI // Golden angle
          
          const x = centerX + Math.cos(angle) * spiralRadius
          const y = centerY + Math.sin(angle) * spiralRadius
          
          if (isPositionValid(x, y)) {
            position = { x, y }
            break
          }
        }
        
        // If spiral fails, try grid-based placement
        if (!position) {
          for (let radius = minDistance; radius < 40; radius += gridSize) {
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 8) {
              const x = centerX + Math.cos(angle) * radius
              const y = centerY + Math.sin(angle) * radius
              
              if (isPositionValid(x, y)) {
                position = { x, y }
                break
              }
            }
            if (position) break
          }
        }
        
        // Fallback: place at edge if no good position found
        if (!position) {
          const fallbackAngle = index * 0.618 * Math.PI
          const fallbackRadius = 35
          position = {
            x: centerX + Math.cos(fallbackAngle) * fallbackRadius,
            y: centerY + Math.sin(fallbackAngle) * fallbackRadius
          }
        }
      }
      
      newPositions.push(position)
      occupiedAreas.push({ 
        x: position.x, 
        y: position.y, 
        size: minDistance 
      })
    })
    
    setPositions(newPositions)
  }, [shouts])

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom(prev => Math.max(0.1, Math.min(5, prev + delta)))
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Handle panning with mouse drag
  useEffect(() => {
    const handleMouseDown = (e) => {
      setIsDragging(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        container.removeEventListener('mousedown', handleMouseDown)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, lastMousePos])

  // Auto-fetch more data as needed (only when wallet is connected)
  useEffect(() => {
    if (isConnected && shouts.length > 0 && shouts.length < 50 && !isLoading) {
      const timer = setTimeout(() => {
        fetchNextShout()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected, shouts.length, isLoading, fetchNextShout])

  // Utility function to format address
  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (error) {
    return (
      <div className="text-blob-container" style={{ 
        color: '#ff0000', 
        textAlign: 'center',
        fontFamily: 'monospace',
        fontSize: '1.2rem',
        marginTop: '2rem'
      }}>
        Error loading void data: {error}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="text-blob-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        background: 'radial-gradient(circle at center, #001122 0%, #000000 100%)'
      }}
    >
      <div
        className="text-blob"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {shouts.map((shout, index) => {
          const position = positions[index]
          if (!position) return null

          return (
            <div
              key={shout.id}
              className="text-item"
              style={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                color: '#00ff88',
                fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
                fontSize: `${Math.max(0.75, 1.0 - index * 0.015)}rem`,
                textShadow: `0 0 ${Math.max(4, 12 - index * 0.2)}px rgba(0, 255, 136, ${Math.max(0.3, 0.8 - index * 0.02)})`,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                opacity: Math.max(0.25, 1 - index * 0.025),
                userSelect: 'none',
                pointerEvents: 'none',
                animation: `fadeIn 0.5s ease-in ${index * 0.1}s backwards`,
                // Squarish container styling
                background: `rgba(0, 30, 20, ${Math.max(0.2, 0.4 - index * 0.01)})`,
                border: `1px solid rgba(0, 255, 136, ${Math.max(0.15, 0.4 - index * 0.015)})`,
                borderRadius: '4px',
                padding: '8px 12px',
                minWidth: '120px',
                maxWidth: '180px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                lineHeight: '1.3',
                backdropFilter: 'blur(2px)',
                boxShadow: `0 0 ${Math.max(5, 15 - index * 0.3)}px rgba(0, 255, 136, ${Math.max(0.05, 0.2 - index * 0.01)})`
              }}
            >
              {shout.message}
            </div>
          )
        })}
        
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '10%',
              transform: 'translateX(-50%)',
              color: '#00ff88',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              opacity: 0.7
            }}
          >
            Loading void data...
          </div>
        )}
      </div>
      
      {/* Navigation and controls */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexDirection: 'column'
        }}
      >
        {/* Connection UI when not connected */}
        {!isConnected && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {!showConnectOptions ? (
              <button
                onClick={() => setShowConnectOptions(true)}
                style={{
                  background: 'rgba(255, 100, 255, 0.1)',
                  border: '1px solid #ff64ff',
                  color: '#ff64ff',
                  fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
                  fontSize: '1rem',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textShadow: '0 0 8px rgba(255, 100, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  animation: 'terminal-glow 2s infinite ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 100, 255, 0.2)'
                  e.target.style.boxShadow = '0 0 15px rgba(255, 100, 255, 0.5)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 100, 255, 0.1)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                wake up void
              </button>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                alignItems: 'center',
                background: 'rgba(0, 0, 20, 0.9)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 100, 255, 0.3)'
              }}>
                <p style={{ 
                  textAlign: 'center', 
                  fontSize: '0.9rem', 
                  marginBottom: '8px',
                  color: '#ff64ff',
                  fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
                  textShadow: '0 0 8px rgba(255, 100, 255, 0.8)'
                }}>
                  {'>'} Requesting permission to know your Ethereum name...
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => connect({ connector })}
                      disabled={isPending}
                      style={{
                        fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
                        fontSize: '0.9rem',
                        padding: '8px 16px',
                        background: 'rgba(0, 255, 0, 0.1)',
                        border: '1px solid #00ff00',
                        color: '#00ff00',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                        opacity: isPending ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isPending) {
                          e.target.style.background = 'rgba(0, 255, 0, 0.2)'
                          e.target.style.boxShadow = '0 0 8px rgba(0, 255, 0, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(0, 255, 0, 0.1)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      {isPending ? 'Connecting...' : `Connect ${connector.name}`}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowConnectOptions(false)}
                    style={{
                      fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
                      fontSize: '0.8rem',
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid #666',
                      color: '#666',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      marginTop: '4px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexDirection: 'column' }}>
          {/* Connected wallet info and disconnect button (when connected) */}
          {isConnected && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              background: 'rgba(0, 0, 20, 0.9)',
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 255, 255, 0.3)'
            }}>
              <span style={{
                fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
                fontSize: '0.8rem',
                color: '#00ffff',
                textShadow: '0 0 4px rgba(0, 255, 255, 0.6)'
              }}>
                Connected: {formatAddress(address)}
              </span>
              <button
                onClick={() => disconnect()}
                style={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid #ff4444',
                  color: '#ff4444',
                  fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
                  fontSize: '0.8rem',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 0, 0, 0.2)'
                  e.target.style.boxShadow = '0 0 8px rgba(255, 68, 68, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 0, 0, 0.1)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                [disconnect]
              </button>
            </div>
          )}

          {/* Interface button */}
          <button
            onClick={onShowInterface}
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid #00ff88',
              color: '#00ff88',
              fontFamily: "'Courier New', 'Monaco', 'Lucida Console', monospace",
              fontSize: '0.9rem',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              textShadow: '0 0 4px rgba(0, 255, 136, 0.6)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 136, 0.2)'
              e.target.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 255, 136, 0.1)'
              e.target.style.boxShadow = 'none'
            }}
          >
            ./interface
          </button>
        </div>
      </div>

      {/* Zoom indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          color: '#00ff88',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          opacity: 0.5,
          userSelect: 'none'
        }}
      >
        Zoom: {(zoom * 100).toFixed(0)}% | Scroll to zoom
      </div>
    </div>
  )
}

export default TextBlob
