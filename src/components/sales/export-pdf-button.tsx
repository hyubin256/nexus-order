"use client";

import { FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderPDF } from "./order-pdf";
import { useEffect, useState } from "react";

interface Props {
  order: any;
}

export const ExportOrderPDFButton = ({ order }: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return (
    <Button variant="outline" className="flex items-center gap-2 w-full justify-center">
      <Printer className="h-4 w-4" />
      In hóa đơn
    </Button>
  );

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      // Ensure dynamic import to avoid SSR issues
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<OrderPDF order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HOA-DON-${order.code || "Moi"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Lỗi khi tạo PDF:", error);
      alert("Không thể tạo file PDF. Lỗi hệ thống hoặc định dạng dữ liệu không hợp lệ.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex w-full items-center justify-center gap-2"
      disabled={isGenerating}
      onClick={handleDownload}
    >
      {isGenerating ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isGenerating ? "Đang tạo PDF..." : "Xuất hóa đơn PDF"}
    </Button>
  );
};
