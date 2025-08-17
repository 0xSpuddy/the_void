import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { VOID_CONTRACT, VOID_ABI } from '../config/contract'

export const useShout = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const { writeContract, data: hash } = useWriteContract()
  
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const shout = async (message) => {
    if (!message.trim()) {
      setError('Please enter a message to shout into the void')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Encode the message as string type for the contract
      const encodedValue = encodeAbiParameters(
        parseAbiParameters('string'),
        [message.trim()]
      )

      // Get current nonce (start with 0, could be improved to check contract state)
      const nonce = 0

      console.log('Shouting with parameters:', {
        queryId: VOID_CONTRACT.QUERY_ID,
        value: encodedValue,
        nonce,
        queryData: VOID_CONTRACT.QUERY_DATA,
        message: message.trim()
      })

      // Call the shout function
      await writeContract({
        address: VOID_CONTRACT.address,
        abi: VOID_ABI,
        functionName: 'shout',
        args: [
          VOID_CONTRACT.QUERY_ID,
          encodedValue,
          nonce,
          VOID_CONTRACT.QUERY_DATA
        ],
      })

      setSuccess(`Send "${message.trim()}" into the void!`)
      
    } catch (err) {
      console.error('Shout error:', err)
      setError(err.message || 'Failed to shout into the void')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    shout,
    isLoading,
    error,
    success,
    isConfirmed,
    hash
  }
}
