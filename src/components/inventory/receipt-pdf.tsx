"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { numberToVietnameseWords } from "@/lib/utils";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 9,
    color: "#475569",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    textTransform: "uppercase",
    color: "#0f172a",
  },
  infoSection: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
  },
  infoBlock: {
    width: "48%",
  },
  label: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: "medium",
    color: "#1e293b",
    marginBottom: 5,
  },
  table: {
    marginTop: 10,
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
  },
  tableColIndex: { width: "8%", padding: 5, textAlign: "center" },
  tableColName: { width: "42%", padding: 5 },
  tableColQty: { width: "10%", padding: 5, textAlign: "center" },
  tableColPrice: { width: "20%", padding: 5, textAlign: "right" },
  tableColTotal: { width: "20%", padding: 5, textAlign: "right" },

  footer: {
    marginTop: 20,
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  summaryLabel: {
    width: "120pt",
    textAlign: "right",
    marginRight: 15,
    color: "#64748b",
  },
  summaryValue: {
    width: "100pt",
    textAlign: "right",
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 14,
    color: "#0f172a",
  },
  wordAmount: {
    fontSize: 9,
    fontStyle: "italic",
    textAlign: "right",
    marginTop: 5,
    color: "#475569",
  },
  signatureSection: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signatureBlock: {
    textAlign: "center",
    width: "30%",
  },
  signatureLabel: {
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 50,
  },
});

interface Props {
  receipt: any;
}

export const ReceiptPDF = ({ receipt }: Props) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN").format(val) + " đ";
  };

  return (
    <Document title={`PHIEU-NHAP-${receipt.code}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>MINH HUY</Text>
            <Text style={{ fontSize: 9, color: "#64748b" }}>Hệ thống quản lý nhập kho tối ưu</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>123 Đường ABC, Phường 15, Quận 10</Text>
            <Text>TP. Hồ Chí Minh, Việt Nam</Text>
            <Text>Hotline: 1900 6789 - info@nexusorder.vn</Text>
          </View>
        </View>

        <Text style={styles.title}>Phiếu Nhập Kho</Text>

        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Nhà cung cấp:</Text>
            <Text style={[styles.value, { fontSize: 11, fontWeight: "bold" }]}>{receipt.supplier?.name || "N/A"}</Text>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{receipt.supplier?.phone || "N/A"}</Text>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>{receipt.supplier?.address || "N/A"}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Số phiếu nhập:</Text>
            <Text style={[styles.value, { color: "#0f172a", fontWeight: "bold" }]}>{receipt.code}</Text>
            <Text style={styles.label}>Ngày lập:</Text>
            <Text style={styles.value}>
              {format(new Date(receipt.createdAt), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </Text>
            <Text style={styles.label}>Người phụ trách:</Text>
            <Text style={styles.value}>{receipt.creator?.name || "Admin Staff"}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColIndex}><Text>#</Text></View>
            <View style={styles.tableColName}><Text>Tên sản phẩm / SKU</Text></View>
            <View style={styles.tableColQty}><Text>SL</Text></View>
            <View style={styles.tableColPrice}><Text>Đơn giá</Text></View>
            <View style={styles.tableColTotal}><Text>Thành tiền</Text></View>
          </View>

          {receipt.inventoryLogs.map((item: any, index: number) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableColIndex}><Text>{index + 1}</Text></View>
              <View style={styles.tableColName}>
                <Text>{item.product.name}</Text>
                <Text style={{ fontSize: 8, color: "#64748b" }}>SKU: {item.product.sku}</Text>
              </View>
              <View style={styles.tableColQty}><Text>{item.quantity}</Text></View>
              <View style={styles.tableColPrice}><Text>{formatCurrency(item.importPrice)}</Text></View>
              <View style={styles.tableColTotal}><Text>{formatCurrency(item.quantity * item.importPrice)}</Text></View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontSize: 12, color: "#0f172a" }]}>Tổng giá trị nhập:</Text>
            <Text style={[styles.summaryValue, styles.totalAmount]}>{formatCurrency(receipt.totalAmount)}</Text>
          </View>
          <Text style={styles.wordAmount}>
            Bằng chữ: {numberToVietnameseWords(receipt.totalAmount)}
          </Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Người giao hàng</Text>
            <Text style={{ fontSize: 8 }}>(Ký và ghi rõ họ tên)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Quản lý kho</Text>
            <Text style={{ fontSize: 8 }}>(Ký và ghi rõ họ tên)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Kế toán</Text>
            <Text style={{ fontSize: 8 }}>(Ký và ghi rõ họ tên)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
