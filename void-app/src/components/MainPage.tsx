import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useENS } from '../hooks/useENS';

export const MainPage: React.FC = () => {
  const { address, provider } = useWallet();
  const { ensName } = useENS(address, provider);
  const [inputText, setInputText] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 140) {
      setInputText(text);
    }
  };

  const handleShout = async () => {
    if (!inputText.trim()) return;
    
    console.log('Shouting to the void:', inputText);
    console.log('User ENS:', ensName);
    console.log('User Address:', address);
    
    setInputText('');
  };

  const handleHashedShout = async () => {
    if (!inputText.trim()) return;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(inputText);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('Hashed shout to the void:', hashHex);
    console.log('Original text:', inputText);
    console.log('User ENS:', ensName);
    console.log('User Address:', address);
    
    setInputText('');
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>The Void</h1>
        <div className="user-info">
          <p>Connected as: {ensName || address}</p>
        </div>
      </header>

      <div className="main-content">
        <section className="input-section">
          <h2>Shout into the Void</h2>
          <div className="input-container">
            <textarea
              value={inputText}
              onChange={handleTextChange}
              placeholder="What do you want to shout into the void?"
              className="text-input"
              maxLength={140}
            />
            <div className="character-count">
              {inputText.length}/140
            </div>
          </div>
          
          <div className="button-container">
            <button 
              onClick={handleShout}
              disabled={!inputText.trim()}
              className="shout-button"
            >
              Shout
            </button>
            <button 
              onClick={handleHashedShout}
              disabled={!inputText.trim()}
              className="hashed-shout-button"
            >
              Hashed Shout
            </button>
          </div>
        </section>

        <section className="void-section">
          <h2>The Void</h2>
          <div className="void-container">
            <p>Your shouts echo into the eternal void...</p>
            <div className="void-visualization">
              🌌
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};