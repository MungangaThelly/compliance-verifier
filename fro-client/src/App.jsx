// src/App.jsx
import { useState } from 'react';
import { useNonce } from './hooks/useNonce';
import Dashboard from './components/Dashboard';
import CSPScanner from './components/CSPScanner';
import ReportGenerator from './components/ReportGenerator';
import { SCAN_URL } from './api';
import './App.css';

// ✅ Environment variables (from Vite)
const API_URL = import.meta.env.VITE_SPRINTO_API_URL;
const IS_DEV = import.meta.env.VITE_APP_ENV === "development";
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

function App() {
  const [scanResults, setScanResults] = useState(null);
  const nonce = useNonce(); // Hämtar nonce från backend

  // Mock-funktion för att simulera API-anrop till Sprinto
  const sendToSprintoAPI = async (data) => {
    try {
      const response = await fetch('http://localhost:3001/api/csp/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }) // Skicka URL som body
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false };
    }
  };

  // Hantera skanningsresultat
  const handleScanComplete = (results) => {
    setScanResults(results);
    
    // Skicka automatiskt till Sprinto (alternativt manuell knapp)
    sendToSprintoAPI(results).then(res => {
      console.log('Sprinto API Response:', res);
    });
  };

  return (
    <div className="app-container">
      
      {nonce && (
      <meta 
        httpEquiv="Content-Security-Policy" 
        content={`script-src 'nonce-${nonce}' 'unsafe-eval' 'strict-dynamic'; object-src 'none';`} 
      />
      )}

      <header>
        <h1>Sprinto Compliance Verifierare</h1>
      </header>

      <main>
        <Dashboard />

        <CSPScanner 
          onScanComplete={handleScanComplete} 
          nonce={nonce}
        />

        {scanResults && (
          <section className="results-section">
            <h2>Scan Results</h2>
            <div className="result-data">
              <pre>{JSON.stringify(scanResults, null, 2)}</pre>
            </div>
            <ReportGenerator data={scanResults} />
          </section>
        )}
      </main>

      <footer>
        <p>Automatiserad compliance-verifiering för moderna webbappar</p>
      </footer>
    </div>
  );
}

export default App;