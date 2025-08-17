import { useState, useEffect, useRef } from 'react'
import { useVoidData } from '../hooks/useVoidData'

const TextBlob = ({ onShowInterface }) => {
  const { shouts, isLoading, error, fetchNextShout } = useVoidData()
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef(null)
  const [positions, setPositions] = useState([])

  // Auto-start fetching data when component mounts
  useEffect(() => {
    fetchNextShout()
  }, [])

  // Generate spiral positions for text elements
  useEffect(() => {
    if (shouts.length === 0) return

    const newPositions = []
    const centerX = 50 // percentage
    const centerY = 50 // percentage
    
    shouts.forEach((shout, index) => {
      if (index === 0) {
        // First item at center
        newPositions.push({ x: centerX, y: centerY })
      } else {
        // Spiral outward
        const angle = (index * 0.5) * Math.PI // Golden ratio spiral
        const radius = Math.sqrt(index) * 8 // Increase radius based on index
        
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        
        newPositions.push({ x, y })
      }
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

  // Auto-fetch more data as needed
  useEffect(() => {
    if (shouts.length > 0 && shouts.length < 50 && !isLoading) {
      const timer = setTimeout(() => {
        fetchNextShout()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [shouts.length, isLoading, fetchNextShout])

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
        cursor: 'grab',
        background: 'radial-gradient(circle at center, #001122 0%, #000000 100%)'
      }}
    >
      <div
        className="text-blob"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
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
                fontSize: `${Math.max(0.8, 1.2 - index * 0.02)}rem`,
                textShadow: '0 0 8px rgba(0, 255, 136, 0.6)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                opacity: Math.max(0.3, 1 - index * 0.02),
                userSelect: 'none',
                pointerEvents: 'none',
                animation: `fadeIn 0.5s ease-in ${index * 0.1}s backwards`
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
          gap: '20px'
        }}
      >
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
