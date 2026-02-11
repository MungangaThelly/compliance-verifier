// src/components/ScanHistory.jsx
import { Trash2, Eye, Download } from 'lucide-react';

export default function ScanHistory({ scanHistory = [], onSelectScan }) {
  const handleDelete = (id) => {
    const updated = scanHistory.filter(scan => scan.id !== id);
    localStorage.setItem('scanHistory', JSON.stringify(updated));
    window.location.reload();
  };

  const handleExport = (scan) => {
    const dataStr = JSON.stringify(scan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan-${scan.id}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scan History</h2>
          <span className="badge badge-info">{scanHistory.length} scans</span>
        </div>

        {scanHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No scans yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">URL</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Risk Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 truncate max-w-xs">
                      {scan.url}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {scan.riskScore}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {scan.riskScore >= 80 && <span className="badge badge-success">Passed</span>}
                      {scan.riskScore >= 40 && scan.riskScore < 80 && (
                        <span className="badge badge-warning">Review</span>
                      )}
                      {scan.riskScore < 40 && <span className="badge badge-danger">Critical</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectScan(scan)}
                          className="btn btn-secondary btn-sm"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleExport(scan)}
                          className="btn btn-secondary btn-sm"
                          title="Download JSON"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(scan.id)}
                          className="btn btn-danger btn-sm"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
