"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderPDF } from "./order-pdf";
import { useEffect, useState } from "react";

interface Props {
  order: any;
}

export const ExportOrderPDFButton = ({ order }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return (
    <Button variant="outline" className="flex items-center gap-2">
      <Printer className="h-4 w-4" />
      In hóa đơn
    </Button>
  );

  return (
    <PDFDownloadLink
      document={<OrderPDF order={order} />}
      fileName={`HOA-DON-${order.code}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" className="flex items-center gap-2" disabled={loading}>
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {loading ? "Đang chuẩn bị..." : "Xuất hóa đơn PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};
