// src/components/CSPScanner.jsx
import { useState, useRef } from 'react';

export default function CSPScanner({ onScanComplete, nonce, disabled }) {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null); // ✅ Create the ref

  const handleScan = async () => {
    if (!url) return;
    
    setIsScanning(true);
    try {
      // Skicka URL till backend för scanning
      const response = await fetch('http://localhost:3001/api/csp/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });
      
      const data = await response.json();
      onScanComplete(data);
    } catch (error) {
      onScanComplete({ 
        error: 'Scanning misslyckades: ' + error.message 
      });
    } finally {
      setIsScanning(false);
      setUrl(''); // Rensar fältet
      inputRef.current?.focus(); // fokus tillbaka till input

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
      />
      <button 
        onClick={handleScan}
        disabled={disabled || isScanning || !url}
      >
        {isScanning ? 'Skannar...' : 'Starta Scanning'}
      </button>
    </div>
  );
}