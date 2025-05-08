import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  code: {
    fontSize: 8,
    fontFamily: 'Courier',
    marginTop: 5,
    backgroundColor: '#eee',
    padding: 5,
  },
});

function evaluateCSP(cspHeader) {
  const lowerCSP = cspHeader?.toLowerCase().trim() || '';
  const hasUnsafeInline = lowerCSP.includes("'unsafe-inline'");
  const hasUnsafeEval = lowerCSP.includes("'unsafe-eval'");

  if (!cspHeader || lowerCSP === 'ingen csp hittades' || lowerCSP === '') {
    return {
      level: 'Låg (Ingen CSP)',
      recommendations: [
        'Inför en Content-Security-Policy (CSP) header.',
        'Börja med "Content-Security-Policy-Report-Only" för testning.',
        'Undvik unsafe-inline och unsafe-eval i produktionskod.',
      ],
      suggestNew: true,
    };
  }

  if (hasUnsafeInline || hasUnsafeEval) {
    return {
      level: 'Medel (CSP hittades, men osäkra direktiv används)',
      recommendations: [
        'Undvik unsafe-inline och unsafe-eval.',
        'Inför nonce- eller hash-baserad scriptvalidering.',
        'Begränsa antalet tredjepartskällor i CSP:n.',
      ],
      suggestNew: true,
    };
  }

  return {
    level: 'Hög (Strikt CSP utan uppenbara osäkra direktiv)',
    recommendations: [
      'Granska regelbundet CSP för att säkerställa att inga nya osäkra direktiv introduceras.',
      'Använd rapporteringsfunktioner för CSP-överträdelser för att finjustera policyn.',
    ],
    suggestNew: false,
  };
}

function suggestCSP() {
  return `
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self';
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  block-all-mixed-content;
  `;
}

export default function ComplianceReport({ data }) {
  const cspAnalysis = evaluateCSP(data?.cspHeader);

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Compliance Rapport</Text>

        <View style={styles.section}>
          <Text>Scannad URL: {data?.url || 'Okänd'}</Text>
        </View>

        <View style={styles.section}>
          <Text>CSP Header: {data?.cspHeader || 'Ingen CSP hittades'}</Text>
        </View>

        <View style={styles.section}>
          <Text>Säkerhetsnivå: {cspAnalysis.level}</Text>
        </View>

        <View style={styles.section}>
          <Text>Identifierade Problem:</Text>
          {data?.issues?.length ? (
            data.issues.map((issue, i) => <Text key={i}>- {issue}</Text>)
          ) : (
            <Text>- Inga säkerhetsproblem upptäcktes</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text>Rekommendationer:</Text>
          {cspAnalysis.recommendations.map((rec, i) => (
            <Text key={i}>- {rec}</Text>
          ))}
        </View>

        {cspAnalysis.suggestNew && (
          <View style={styles.section}>
            <Text>Förslag på förbättrad CSP:</Text>
            <Text style={styles.code}>{suggestCSP()}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
