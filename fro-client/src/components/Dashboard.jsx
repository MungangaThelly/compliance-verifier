// src/components/Dashboard.jsx
import { BarChart3, TrendingUp, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard({ scanResults, scanHistory = [] }) {
  const totalScans = scanHistory.length;
  const averageRiskScore = scanHistory.length > 0
    ? Math.round(scanHistory.reduce((sum, scan) => sum + (scan.riskScore || 0), 0) / scanHistory.length)
    : 0;
  
  const highRiskScans = scanHistory.filter(scan => scan.riskScore < 40).length;
  const passedScans = scanHistory.filter(scan => scan.riskScore >= 80).length;

  // Chart data
  const lineData = {
    labels: scanHistory.slice(-10).reverse().map((_, i) => `Scan ${i + 1}`),
    datasets: [
      {
        label: 'Risk Score Trend',
        data: scanHistory.slice(-10).reverse().map(scan => scan.riskScore || 0),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointRadius: 5,
      },
    ],
  };

  const pieData = {
    labels: ['Passed (80+)', 'Needs Improvement (40-79)', 'Critical (<40)'],
    datasets: [
      {
        data: [passedScans, scanHistory.length - passedScans - highRiskScans, highRiskScans],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)'],
        borderColor: ['white', 'white', 'white'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Scans</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalScans}</p>
            </div>
            <BarChart3 className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Risk Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{averageRiskScore}</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{passedScans}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{highRiskScans}</p>
            </div>
            <AlertCircle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Charts */}
      {scanHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Score Trend</h3>
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Distribution</h3>
            <div className="flex justify-center">
              <div style={{ width: '200px', height: '200px' }}>
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Scans */}
      {scanHistory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Scans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-white">URL</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-white">Risk Score</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.slice(0, 5).map((scan) => (
                  <tr key={scan.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300 truncate max-w-xs">{scan.url}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {scan.riskScore}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {scan.riskScore >= 80 && <span className="badge badge-success">Passed</span>}
                      {scan.riskScore >= 40 && scan.riskScore < 80 && <span className="badge badge-warning">Review</span>}
                      {scan.riskScore < 40 && <span className="badge badge-danger">Critical</span>}
                    </td>
                    <td className="py-3 px-2 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {scanHistory.length === 0 && (
        <div className="card text-center py-12">
          <ShieldAlert size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No scans yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Start by scanning a website to see compliance results</p>
        </div>
      )}
    </div>
  );
}