import { useState, useEffect } from 'react';
import { NONCE_URL } from '../api';

export function useNonce() {
  const [nonce, setNonce] = useState('');

  useEffect(() => {
    const generateNonce = async () => {
      try {
        const response = await fetch(NONCE_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setNonce(data.nonce);
      } catch (error) {
        console.error('Failed to fetch nonce:', error);
        // Fallback till lokal generering
        setNonce(window.btoa(Math.random().toString()).slice(0, 32));
      }
    };

    generateNonce();
  }, []);

  return nonce;
}