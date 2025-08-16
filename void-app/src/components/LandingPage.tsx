import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { useENS } from '../hooks/useENS';

interface LandingPageProps {
  onENSVerified: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onENSVerified }) => {
  const { address, provider, isConnected, isConnecting, error, connectWallet } = useWallet();
  const { ensName, isLoading: ensLoading, error: ensError } = useENS(address, provider);

  React.useEffect(() => {
    if (isConnected && ensName) {
      onENSVerified();
    }
  }, [isConnected, ensName, onENSVerified]);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="landing-container">
          <h1>Welcome to The Void</h1>
          <p>Shout into the void with your ENS identity</p>
          <button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="connect-button"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet to Shout into the Void'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      );
    }

    if (ensLoading) {
      return (
        <div className="landing-container">
          <h1>Checking ENS Name...</h1>
          <p>Please wait while we verify your ENS configuration</p>
        </div>
      );
    }

    if (!ensName) {
      return (
        <div className="landing-container">
          <h1>ENS Name Required</h1>
          <p>An ENS name is required to reduce spam. Please connect a wallet with a configured primary ENS name.</p>
          <p>Connected address: {address}</p>
          {ensError && <p className="error">ENS Error: {ensError}</p>}
        </div>
      );
    }

    return null;
  };

  return renderContent();
};