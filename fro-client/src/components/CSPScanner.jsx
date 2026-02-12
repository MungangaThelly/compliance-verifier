// src/components/CSPScanner.jsx
import { useState, useRef, useEffect } from 'react';
import { Search, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { SCAN_URL } from '../api';

export default function CSPScanner({ onScanComplete, nonce, disabled, timeout = 30000 }) {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

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
    setError(null);
    setSuccess(null);
    abortControllerRef.current = new AbortController();

    try {
      timeoutRef.current = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, timeout);

      setProgress('Analyzing website...');

      const response = await fetch(SCAN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutRef.current);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      onScanComplete(data);
      setSuccess('Scan completed successfully!');
      setProgress(null);
      setUrl('');
    } catch (error) {
      if (error.name !== 'AbortError') {
        const errorMsg = error.message || 'Scanning failed';
        setError(errorMsg);
        onScanComplete({ error: errorMsg });
      } else {
        setError('Scan was cancelled');
      }
      setProgress(null);
    } finally {
      setIsScanning(false);
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
    <div className="space-y-6">
      <div className="card card-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Start a Scan</h2>

        <div className="space-y-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.example.com"
                disabled={disabled || isScanning}
                onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleScan()}
                className="input flex-1"
              />
              <button
                onClick={handleScan}
                disabled={disabled || isScanning || !url}
                className="btn btn-primary btn-lg"
              >
                {isScanning ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress */}
          {isScanning && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{progress}</p>
                  <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse width-50" />
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-200">Scan Error</h4>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CSP Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analyzes Content Security Policy headers and meta tags
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Assessment</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Identifies missing directives and security vulnerabilities
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Provides actionable remediation advice
          </p>
        </div>
      </div>
    </div>
  );
}