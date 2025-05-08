// src/components/CSPScanner.jsx
import { useState, useRef, useEffect } from 'react';

export default function CSPScanner({ onScanComplete, nonce, disabled, timeout = 30000 }) {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleScan = async () => {
    if (!url) return;
    
    setIsScanning(true);
    setProgress('Starting scan...');
    abortControllerRef.current = new AbortController();
    
    try {
      // Set timeout
      timeoutRef.current = setTimeout(() => {
        abortControllerRef.current?.abort();
        throw new Error('Scan timed out');
      }, timeout);

      const response = await fetch('http://localhost:3001/api/csp/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutRef.current);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      onScanComplete(data);
      setProgress('Scan completed successfully');
    } catch (error) {
      if (error.name !== 'AbortError') {
        onScanComplete({ 
          error: error.message || 'Scanning failed'
        });
        setProgress(`Scan failed: ${error.message}`);
      } else {
        setProgress('Scan was cancelled');
      }
    } finally {
      setIsScanning(false);
      setUrl('');
      inputRef.current?.focus();
      abortControllerRef.current = null;
      timeoutRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="scanner-container">
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.example.com"
        disabled={disabled || isScanning}
        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
      />
      
      <div className="scanner-actions">
        <button 
          onClick={handleScan}
          disabled={disabled || isScanning || !url}
        >
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </button>
        
        {isScanning && (
          <button 
            onClick={handleCancel}
            className="cancel-button"
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
      
      {progress && <div className="scan-progress">{progress}</div>}
    </div>
  );
}