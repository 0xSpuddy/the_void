import { useState, useEffect, useCallback } from 'react'
import { useReadContract } from 'wagmi'
import { decodeAbiParameters, parseAbiParameters } from 'viem'
import { VOID_CONTRACT } from '../config/contract'

const VOID_QUERY_ID = '0x744fe0d0f4e1d68948bbc1b5a818a89684134653f357e2098a9e3db868a2cf89'
const CACHE_KEY = 'void_shouts_cache'
const CACHE_TIMESTAMP_KEY = 'void_cache_timestamp'

export const useVoidData = () => {
  const [shouts, setShouts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentTimestamp, setCurrentTimestamp] = useState(null)

  // Load cached data on mount
  useEffect(() => {
    loadCachedData()
  }, [])

  const loadCachedData = () => {
    try {
      const cachedShouts = localStorage.getItem(CACHE_KEY)
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      
      if (cachedShouts) {
        const parsedShouts = JSON.parse(cachedShouts)
        setShouts(parsedShouts)
        
        // If we have cached data, set current timestamp to the oldest one
        if (parsedShouts.length > 0) {
          const oldestShout = parsedShouts[parsedShouts.length - 1]
          setCurrentTimestamp(oldestShout.timestamp - 1)
        }
      }
      
      // Auto-refresh if cache is older than 5 minutes
      if (cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp)
        if (cacheAge > 5 * 60 * 1000) { // 5 minutes
          console.log('Cache is stale, will refresh on next fetch')
        }
      }
    } catch (err) {
      console.error('Error loading cached data:', err)
    }
  }

  const saveCachedData = (shoutsData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(shoutsData))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (err) {
      console.error('Error saving cached data:', err)
    }
  }

  const { data: contractResult, error: contractError, refetch } = useReadContract({
    address: VOID_CONTRACT.address,
    abi: [
      {
        "inputs": [
          {"internalType": "bytes32", "name": "_queryId", "type": "bytes32"},
          {"internalType": "uint256", "name": "_timestamp", "type": "uint256"}
        ],
        "name": "getDataBefore",
        "outputs": [
          {"internalType": "bool", "name": "_ifRetrieve", "type": "bool"},
          {"internalType": "bytes", "name": "_value", "type": "bytes"},
          {"internalType": "uint256", "name": "_timestampRetrieved", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getDataBefore',
    args: currentTimestamp ? [VOID_QUERY_ID, currentTimestamp] : undefined,
    enabled: !!currentTimestamp,
  })

  const decodeShoutMessage = (valueBytes) => {
    try {
      if (!valueBytes || valueBytes === '0x') return 'Empty message'
      
      // Try to decode as string (which is how shout encodes messages)
      const decoded = decodeAbiParameters(
        parseAbiParameters('string'),
        valueBytes
      )
      return decoded[0] || 'Could not decode message'
    } catch (err) {
      console.error('Error decoding message:', err)
      return `Raw bytes: ${valueBytes}`
    }
  }

  const fetchNextShout = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      if (!currentTimestamp) {
        // First fetch - start from current time
        setCurrentTimestamp(Math.floor(Date.now() / 1000))
        return
      }

      // Trigger the contract call
      const result = await refetch()
      
      if (contractError) {
        throw new Error(contractError.message)
      }

      if (result.data) {
        const [ifRetrieve, value, timestampRetrieved] = result.data
        
        if (!ifRetrieve) {
          setHasMore(false)
          console.log('No more shouts found')
          return
        }

        const message = decodeShoutMessage(value)
        const newShout = {
          timestamp: Number(timestampRetrieved),
          message,
          valueHex: value,
          dateTime: new Date(Number(timestampRetrieved) * 1000).toISOString(),
          id: `${timestampRetrieved}_${value}`
        }

        setShouts(prevShouts => {
          // Avoid duplicates
          const exists = prevShouts.some(shout => shout.id === newShout.id)
          if (exists) return prevShouts
          
          const updatedShouts = [...prevShouts, newShout]
          saveCachedData(updatedShouts)
          return updatedShouts
        })

        // Set next timestamp for the next fetch
        setCurrentTimestamp(Number(timestampRetrieved) - 1)
      }
    } catch (err) {
      console.error('Error fetching shout:', err)
      setError(err.message || 'Failed to fetch shout data')
    } finally {
      setIsLoading(false)
    }
  }, [currentTimestamp, isLoading, hasMore, refetch, contractError])

  const startFetching = () => {
    if (!currentTimestamp) {
      setCurrentTimestamp(Math.floor(Date.now() / 1000))
    } else {
      fetchNextShout()
    }
  }

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    setShouts([])
    setCurrentTimestamp(null)
    setHasMore(true)
    setError(null)
  }

  // Auto-fetch when currentTimestamp changes
  useEffect(() => {
    if (currentTimestamp && currentTimestamp !== Math.floor(Date.now() / 1000)) {
      fetchNextShout()
    }
  }, [currentTimestamp, fetchNextShout])

  return {
    shouts,
    isLoading,
    error,
    hasMore,
    fetchNextShout: startFetching,
    clearCache,
    totalShouts: shouts.length
  }
}
