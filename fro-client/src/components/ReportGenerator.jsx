// src/components/ReportGenerator.jsx  
import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ComplianceReport from './ComplianceReport';
import { Download, Eye, X } from 'lucide-react';

export function ReportGenerator({ data }) {
  const [showPreview, setShowPreview] = useState(false);

  if (!data || data.error) {
    return null;
  }

  const getRiskLevel = () => {
    const csp = data.cspHeader || '';
    const score = data.riskScore || 0;
    
    if (score >= 80) return { level: 'Low Risk', color: 'green' };
    if (score >= 40) return { level: 'Medium Risk', color: 'yellow' };
    return { level: 'High Risk', color: 'red' };
  };

  const getRecommendations = () => {
    const csp = (data.cspHeader || '').toLowerCase();
    const recommendations = [];

    if (!data.cspHeader || data.cspHeader === 'Ingen CSP hittades') {
      recommendations.push({
        title: 'Missing CSP Header',
        severity: 'Critical',
        action: 'Implement a Content-Security-Policy header',
      });
    } else {
      if (!csp.includes('default-src')) {
        recommendations.push({
          title: 'Missing default-src directive',
          severity: 'High',
          action: "Add 'default-src' directive to CSP",
        });
      }
      if (!csp.includes('script-src')) {
        recommendations.push({
          title: 'Missing script-src directive',
          severity: 'High',
          action: "Add 'script-src' directive to CSP",
        });
      }
      if (csp.includes('unsafe-inline')) {
        recommendations.push({
          title: "Unsafe 'unsafe-inline' directive",
          severity: 'High',
          action: 'Remove unsafe-inline and use nonces or hashes',
        });
      }
      if (csp.includes('unsafe-eval')) {
        recommendations.push({
          title: "Unsafe 'unsafe-eval' directive",
          severity: 'Medium',
          action: 'Remove unsafe-eval from CSP',
        });
      }
    }

    return recommendations.length > 0
      ? recommendations
      : [{ title: 'No issues found', severity: 'Info', action: 'CSP looks secure' }];
  };

  const risk = getRiskLevel();
  const recommendations = getRecommendations();

  return (
    <div className="space-y-4">
      {/* Report Summary Card */}
      <div className="card card-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compliance Report</h3>
          <span
            className={`badge badge-${risk.color === 'red' ? 'danger' : risk.color === 'yellow' ? 'warning' : 'success'}`}
          >
            {risk.level}
          </span>
        </div>

        {/* URL Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Scanned URL</p>
          <p className="text-gray-900 dark:text-white font-medium truncate">{data.url}</p>
        </div>

        {/* CSP Header */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Content-Security-Policy</h4>
          {data.cspHeader && data.cspHeader !== 'Ingen CSP hittades' ? (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
              <code className="text-xs text-gray-700 dark:text-gray-300 break-all">
                {data.cspHeader}
              </code>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">No CSP header found</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className={`border-l-4 p-4 rounded-r-lg ${
                rec.severity === 'Critical'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : rec.severity === 'High'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : rec.severity === 'Medium'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <p className="font-semibold text-gray-900 dark:text-white">{rec.title}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{rec.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <PDFDownloadLink
          document={<ComplianceReport data={data} />}
          fileName={`compliance-report-${new Date().toISOString().slice(0, 10)}.pdf`}
        >
          {({ loading }) => (
            <button className="btn btn-primary" disabled={loading}>
              <Download size={20} />
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          )}
        </PDFDownloadLink>

        <button onClick={() => setShowPreview(!showPreview)} className="btn btn-secondary">
          <Eye size={20} />
          {showPreview ? 'Hide Preview' : 'Preview Report'}
        </button>

        <button
          onClick={() => {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scan-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
          }}
          className="btn btn-secondary"
        >
          <Download size={20} />
          Export JSON
        </button>
      </div>

      {/* Report Preview */}
      {showPreview && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Report Preview</h4>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg space-y-4">
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">Summary</h5>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                This report summarizes the compliance scan results for{' '}
                <strong>{data.url}</strong>
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">Findings</h5>
              <ul className="text-gray-600 dark:text-gray-300 text-sm mt-2 space-y-1 list-disc list-inside">
                {recommendations.map((rec, i) => (
                  <li key={i}>
                    <strong>{rec.title}:</strong> {rec.action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportGenerator;