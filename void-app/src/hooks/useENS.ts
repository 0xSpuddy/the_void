import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface ENSState {
  ensName: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useENS = (address: string | null, provider: ethers.BrowserProvider | null) => {
  const [ensState, setENSState] = useState<ENSState>({
    ensName: null,
    isLoading: false,
    error: null,
  });

  const checkENSName = async () => {
    if (!address || !provider) {
      setENSState({ ensName: null, isLoading: false, error: null });
      return;
    }

    setENSState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const sepoliaProvider = new ethers.JsonRpcProvider(import.meta.env.VITE_SEPOLIA_RPC_URL);
      
      const ensName = await sepoliaProvider.lookupAddress(address);
      
      if (ensName) {
        const resolvedAddress = await sepoliaProvider.resolveName(ensName);
        if (resolvedAddress?.toLowerCase() === address.toLowerCase()) {
          setENSState({
            ensName,
            isLoading: false,
            error: null,
          });
        } else {
          setENSState({
            ensName: null,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setENSState({
          ensName: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error checking ENS name:', error);
      setENSState({
        ensName: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check ENS name',
      });
    }
  };

  useEffect(() => {
    checkENSName();
  }, [address, provider]);

  return {
    ...ensState,
    refetchENS: checkENSName,
  };
};