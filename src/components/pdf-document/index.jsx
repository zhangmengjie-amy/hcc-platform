// components/PdfDocument.js
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// 定义样式
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

// PDF 文档组件
const PdfDocument = ({ title, content }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>{content}</Text>
      </View>
    </Page>
  </Document>
);

export default PdfDocument;