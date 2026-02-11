// src/App.jsx
import { useState, useEffect } from 'react';
import { useNonce } from './hooks/useNonce';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CSPScanner from './components/CSPScanner';
import ScanHistory from './components/ScanHistory';
import Settings from './components/Settings';
import ReportGenerator from './components/ReportGenerator';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [scanResults, setScanResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const nonce = useNonce();

  // Handle dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load scan history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scanHistory');
    if (saved) {
      try {
        setScanHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load scan history:', e);
      }
    }
  }, []);

  const sendToITWeorABAPI = async (data) => {
    try {
      const response = await fetch('http://localhost:3001/api/csp/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleScanComplete = async (results) => {
    const scanData = {
      id: Date.now(),
      ...results,
      timestamp: new Date().toISOString(),
      riskScore: calculateRiskScore(results),
    };

    setScanResults(scanData);

    // Add to history
    const updatedHistory = [scanData, ...scanHistory].slice(0, 50);
    setScanHistory(updatedHistory);
    localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

    // Send to API
    const apiResponse = await sendToITWeorABAPI(results);
    console.log('IT-Weor AB API Response:', apiResponse);
  };

  const calculateRiskScore = (results) => {
    // Simple risk scoring based on CSP findings
    let score = 100;

    if (!results.cspHeader || results.cspHeader === 'Ingen CSP hittades') {
      score -= 40;
    } else {
      // Penalize missing directives
      const cspString = results.cspHeader.toLowerCase();
      if (!cspString.includes('default-src')) score -= 15;
      if (!cspString.includes('script-src')) score -= 15;
      if (!cspString.includes('object-src')) score -= 10;
      if (cspString.includes('unsafe-inline')) score -= 20;
      if (cspString.includes('unsafe-eval')) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activePage={activePage} setActivePage={setActivePage} darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main Content */}
        <main className="lg:ml-64">
          <div className="p-4 lg:p-8">
            {nonce && (
              <meta
                httpEquiv="Content-Security-Policy"
                content={`script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none';`}
              />
            )}

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                IT-Weor AB Compliance Verifierare
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Automatiserad compliance-verifiering för moderna webbappar
              </p>
            </div>

            {/* Page Content */}
            <div className="animate-fade-in">
              {activePage === 'dashboard' && <Dashboard scanResults={scanResults} scanHistory={scanHistory} />}
              {activePage === 'scanner' && (
                <>
                  <CSPScanner onScanComplete={handleScanComplete} nonce={nonce} />
                  {scanResults && (
                    <div className="mt-6">
                      <ReportGenerator data={scanResults} />
                    </div>
                  )}
                </>
              )}
              {activePage === 'history' && <ScanHistory scanHistory={scanHistory} onSelectScan={setScanResults} />}
              {activePage === 'settings' && <Settings />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;