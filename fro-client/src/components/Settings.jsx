// src/components/Settings.jsx
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    scanTimeout: 30,
    maxHistory: 50,
  });
  const [saveStatus, setSaveStatus] = useState(null);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all scan history?')) {
      localStorage.removeItem('scanHistory');
      setSaveStatus('cleared');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card card-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

        {/* General Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Auto-save Scans</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save scan results</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300">Notifications</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive scan completion notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scan Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scan Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={settings.scanTimeout}
                  onChange={(e) => handleChange('scanTimeout', parseInt(e.target.value))}
                  className="input max-w-xs"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Maximum time to wait for scan completion
                </p>
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max History Entries
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={settings.maxHistory}
                  onChange={(e) => handleChange('maxHistory', parseInt(e.target.value))}
                  className="input max-w-xs"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Number of scans to keep in history
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-200">Danger Zone</h4>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                    Clear all scan history. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <button onClick={handleClearHistory} className="btn btn-danger">
              Clear History
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-4">
          <button onClick={handleSave} className="btn btn-primary btn-lg">
            <Save size={20} />
            Save Settings
          </button>

          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle size={20} />
              <span>Settings saved successfully</span>
            </div>
          )}

          {saveStatus === 'cleared' && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <CheckCircle size={20} />
              <span>History cleared. Reloading...</span>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h3>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>
            <strong>IT-Weor AB Compliance Verifierare</strong>
          </p>
          <p>Version: 1.0.0</p>
          <p>© 2026 IT-Weor AB. All rights reserved.</p>
          <p className="text-sm">
            Automated compliance verification tool for modern web applications. Scan your websites for
            security risks and generate compliance reports.
          </p>
        </div>
      </div>
    </div>
  );
}
