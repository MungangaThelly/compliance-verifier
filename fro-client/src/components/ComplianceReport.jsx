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
});

export default function ComplianceReport({ data }) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Compliance Rapport</Text>
        <View style={styles.section}>
          <Text>Scannad URL: {data?.url || 'Okänd'}</Text>
        </View>
        <View style={styles.section}>
          <Text>CSP: {data?.cspHeader || 'Ingen CSP hittades'}</Text>
        </View>
        <View style={styles.section}>
          <Text>Problem: Inga problem </Text>
          {data?.issues?.map((issue, i) => (
            <Text key={i}>- {issue}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}