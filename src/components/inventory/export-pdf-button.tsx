"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptPDF } from "./receipt-pdf";
import { useEffect, useState } from "react";

interface Props {
  receipt: any;
}

export const ExportPDFButton = ({ receipt }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <PDFDownloadLink
      document={<ReceiptPDF receipt={receipt} />}
      fileName={`receipt-${receipt.code}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          <FileDown className="mr-2 h-4 w-4" />
          {loading ? "Đang chuẩn bị..." : "Xuất file PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};
