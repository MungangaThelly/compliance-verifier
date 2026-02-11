import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    backgroundColor: '#f3f4f6',
    padding: 10,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
    color: '#374151',
  },
  value: {
    width: '70%',
    color: '#1f2937',
  },
  listItem: {
    marginBottom: 5,
    marginLeft: 15,
  },
  bullet: {
    marginRight: 5,
  },
  riskScore: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  riskHigh: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  riskMedium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  riskLow: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  cspBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginTop: 8,
    fontSize: 9,
    fontFamily: 'Courier',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  recommendationBox: {
    backgroundColor: '#eff6ff',
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
  },
  findingBox: {
    backgroundColor: '#fef2f2',
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 25,
    right: 40,
    fontSize: 9,
    color: '#9ca3af',
  },
  footer: {
    marginTop: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 9,
    color: '#6b7280',
  },
});

function analyzeCSP(cspHeader) {
  const csp = (cspHeader || '').toLowerCase().trim();
  const findings = [];
  const analysis = {
    hasCsp: csp && csp !== 'ingen csp hittades',
    directives: {},
    issues: [],
    riskScore: 100,
  };

  if (!analysis.hasCsp) {
    analysis.issues.push({
      severity: 'Critical',
      title: 'No CSP Header Found',
      description: 'The website does not implement Content-Security-Policy headers.',
    });
    analysis.riskScore = 20;
    return analysis;
  }

  // Parse directives
  const directiveList = csp.split(';').map(d => d.trim()).filter(d => d);
  const requiredDirectives = ['default-src', 'script-src', 'style-src', 'object-src'];

  requiredDirectives.forEach(directive => {
    const hasDirective = directiveList.some(d => d.startsWith(directive));
    analysis.directives[directive] = hasDirective;
  });

  // Check for unsafe patterns
  if (csp.includes('unsafe-inline')) {
    analysis.issues.push({
      severity: 'High',
      title: "Use of 'unsafe-inline'",
      description: 'Allows inline scripts, defeating CSP purpose.',
    });
    analysis.riskScore -= 25;
  }

  if (csp.includes('unsafe-eval')) {
    analysis.issues.push({
      severity: 'High',
      title: "Use of 'unsafe-eval'",
      description: 'Allows eval() execution, major security risk.',
    });
    analysis.riskScore -= 20;
  }

  if (!analysis.directives['default-src']) {
    analysis.issues.push({
      severity: 'Medium',
      title: 'Missing default-src',
      description: 'Provides fallback for all directives.',
    });
    analysis.riskScore -= 15;
  }

  if (!analysis.directives['script-src']) {
    analysis.issues.push({
      severity: 'High',
      title: 'Missing script-src',
      description: 'No control over script sources.',
    });
    analysis.riskScore -= 20;
  }

  if (csp.includes('*')) {
    analysis.issues.push({
      severity: 'Medium',
      title: 'Wildcard Source',
      description: 'Using * allows content from any source.',
    });
    analysis.riskScore -= 15;
  }

  if (!analysis.directives['object-src']) {
    analysis.issues.push({
      severity: 'Medium',
      title: 'Missing object-src',
      description: 'Allows embed/object/applet elements.',
    });
    analysis.riskScore -= 10;
  }

  analysis.riskScore = Math.max(0, analysis.riskScore);

  return analysis;
}

function getRecommendations(analysis) {
  const recommendations = [];

  if (!analysis.hasCsp) {
    recommendations.push({
      priority: 1,
      title: 'Implement Content-Security-Policy',
      action: 'Add CSP header to all responses with strict directives.',
      example: "Content-Security-Policy: default-src 'self'; script-src 'self'",
    });
    recommendations.push({
      priority: 2,
      title: 'Use Report-Only Mode First',
      action: 'Start with Content-Security-Policy-Report-Only to monitor violations.',
      example: 'Content-Security-Policy-Report-Only: ...',
    });
  }

  if (analysis.issues.some(i => i.title.includes('unsafe-inline'))) {
    recommendations.push({
      priority: 1,
      title: 'Remove unsafe-inline',
      action: 'Use nonce or hash-based script execution instead.',
      example: "script-src 'nonce-random123'",
    });
  }

  if (analysis.issues.some(i => i.title.includes('unsafe-eval'))) {
    recommendations.push({
      priority: 1,
      title: 'Remove unsafe-eval',
      action: 'Avoid eval() and use alternative methods for dynamic code.',
      example: 'script-src: Remove unsafe-eval directive',
    });
  }

  if (!analysis.directives['script-src']) {
    recommendations.push({
      priority: 1,
      title: 'Add script-src directive',
      action: 'Explicitly define which scripts are allowed to execute.',
      example: "script-src 'self' https://trusted-cdn.com",
    });
  }

  if (!analysis.directives['object-src']) {
    recommendations.push({
      priority: 2,
      title: 'Add object-src directive',
      action: 'Disable plugins and object embedding.',
      example: "object-src 'none'",
    });
  }

  if (analysis.issues.some(i => i.title.includes('Wildcard'))) {
    recommendations.push({
      priority: 2,
      title: 'Replace Wildcards with Specific Sources',
      action: 'Use specific domain or self instead of *.',
      example: "script-src 'self' https://trusted.com instead of script-src *",
    });
  }

  if (analysis.riskScore < 50) {
    recommendations.push({
      priority: 3,
      title: 'Regular Security Audits',
      action: 'Perform quarterly CSP reviews and penetration testing.',
      example: 'Schedule security audits every 3 months',
    });
  }

  return recommendations;
}

export default function ComplianceReport({ data }) {
  const cspAnalysis = analyzeCSP(data?.cspHeader);
  const recommendations = getRecommendations(cspAnalysis);

  const getRiskColor = (score) => {
    if (score >= 80) return styles.riskLow;
    if (score >= 40) return styles.riskMedium;
    return styles.riskHigh;
  };

  return (
    <Document>
      {/* Page 1: Executive Summary */}
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>IT-Weor AB</Text>
          <Text style={styles.subtitle}>Compliance & Security Audit Report</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Scanned URL:</Text>
            <Text style={styles.value}>{data?.url || 'Unknown'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Scan Date:</Text>
            <Text style={styles.value}>{new Date(data?.timestamp || Date.now()).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Report Type:</Text>
            <Text style={styles.value}>Content Security Policy Analysis</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.riskScore, getRiskColor(data?.riskScore || cspAnalysis.riskScore)]}>
            Risk Score: {data?.riskScore || cspAnalysis.riskScore}/100
          </Text>
        </View>

        {/* CSP Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CSP Analysis</Text>
          <Text style={styles.subsectionTitle}>Analyzes Content Security Policy headers and meta tags</Text>
          
          <View style={styles.listItem}>
            <Text>CSP Header Status: {cspAnalysis.hasCsp ? 'Present' : 'Missing'}</Text>
          </View>

          {cspAnalysis.hasCsp && (
            <>
              <Text style={styles.subsectionTitle}>Detected Directives:</Text>
              {Object.entries(cspAnalysis.directives).map(([directive, found]) => (
                <View key={directive} style={styles.listItem}>
                  <Text>• {directive}: {found ? '✓ Found' : '✗ Missing'}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.subsectionTitle}>Current CSP Header:</Text>
          <View style={styles.cspBox}>
            <Text>{data?.cspHeader || 'No CSP header found'}</Text>
          </View>
        </View>

        <View style={styles.pageNumber}>
          <Text>Page 1</Text>
        </View>
      </Page>

      {/* Page 2: Risk Assessment */}
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Risk Assessment</Text>
          <Text style={styles.subtitle}>Identifies missing directives and security vulnerabilities</Text>
        </View>

        {cspAnalysis.issues.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identified Vulnerabilities</Text>
            {cspAnalysis.issues.map((issue, idx) => (
              <View key={idx} style={styles.findingBox}>
                <View style={styles.row}>
                  <Text style={styles.label}>Severity:</Text>
                  <Text style={styles.value}>{issue.severity}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Issue:</Text>
                  <Text style={styles.value}>{issue.title}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Details:</Text>
                  <Text style={styles.value}>{issue.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.riskScore, styles.riskLow]}>✓ No critical vulnerabilities detected</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Risk Summary:</Text>
          <View style={styles.listItem}>
            <Text>Total Issues Found: {cspAnalysis.issues.length}</Text>
          </View>
          <View style={styles.listItem}>
            <Text>Critical Issues: {cspAnalysis.issues.filter(i => i.severity === 'Critical').length}</Text>
          </View>
          <View style={styles.listItem}>
            <Text>High Priority: {cspAnalysis.issues.filter(i => i.severity === 'High').length}</Text>
          </View>
          <View style={styles.listItem}>
            <Text>Medium Priority: {cspAnalysis.issues.filter(i => i.severity === 'Medium').length}</Text>
          </View>
        </View>

        <View style={styles.pageNumber}>
          <Text>Page 2</Text>
        </View>
      </Page>

      {/* Page 3: Recommendations */}
      <Page style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Actionable Recommendations</Text>
          <Text style={styles.subtitle}>Provides remediation advice and implementation guidance</Text>
        </View>

        {recommendations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Implementation Steps</Text>
            {recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recommendationBox}>
                <View style={styles.row}>
                  <Text style={styles.label}>Priority:</Text>
                  <Text style={styles.value}>Level {rec.priority}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Action:</Text>
                  <Text style={styles.value}>{rec.title}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Details:</Text>
                  <Text style={styles.value}>{rec.action}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Example:</Text>
                  <Text style={styles.value}>{rec.example}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.riskScore, styles.riskLow]}>✓ No recommendations at this time</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>This report was generated by IT-Weor AB Compliance Verifierare</Text>
          <Text>For security concerns, please contact your security team immediately</Text>
        </View>

        <View style={styles.pageNumber}>
          <Text>Page 3</Text>
        </View>
      </Page>
    </Document>
  );
}
