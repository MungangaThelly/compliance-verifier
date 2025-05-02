// src/components/ReportGenerator.jsx  
import { PDFDownloadLink } from "@react-pdf/renderer";
import ComplianceReport from './ComplianceReport';

export function ReportGenerator({ data }) {
  return (
    <PDFDownloadLink
      document={<ComplianceReport data={data} />}
      fileName="compliance-report.pdf"
    >
      {({ loading }) => (loading ? "Genererar..." : "Ladda ner rapport")}
    </PDFDownloadLink>
  );
}

export default ReportGenerator;