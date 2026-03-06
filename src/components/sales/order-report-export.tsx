"use client";

import * as React from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getOrders } from "@/actions/order";

export function OrderReportExport({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Vui lòng chọn khoảng thời gian báo cáo.");
      return;
    }

    try {
      setIsExporting(true);

      // Fetch data for the range
      const result = await getOrders({
        startDate: startOfDay(date.from).toISOString(),
        endDate: endOfDay(date.to).toISOString(),
        limit: 10000, // Fetch many for report
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Không thể lấy dữ liệu đơn hàng.");
      }

      const orders = result.data;

      if (orders.length === 0) {
        toast.error("Không có đơn hàng nào trong khoảng thời gian này.");
        return;
      }

      // Create Workbook
      const workbook = new ExcelJS.Workbook();

      // Sheet 1: Tổng hợp
      const summarySheet = workbook.addWorksheet("Tổng hợp");

      const totalRevenue = orders.reduce((acc: number, curr: any) => acc + curr.finalAmount, 0);
      const totalOrders = orders.length;
      const totalDiscount = orders.reduce((acc: number, curr: any) => {
        const discount = curr.discountType === 'PERCENT'
          ? (curr.totalAmount * (curr.discountValue || 0)) / 100
          : (curr.discountValue || 0);
        return acc + discount;
      }, 0);

      summarySheet.columns = [
        { header: "Tiêu chí", key: "label", width: 25 },
        { header: "Giá trị", key: "value", width: 25 },
      ];

      summarySheet.addRow({ label: "Từ ngày", value: format(date.from, "dd/MM/yyyy") });
      summarySheet.addRow({ label: "Đến ngày", value: format(date.to, "dd/MM/yyyy") });
      summarySheet.addRow({}); // Empty row
      summarySheet.addRow({ label: "Tổng số đơn hàng", value: totalOrders });
      summarySheet.addRow({ label: "Tổng doanh thu (VNĐ)", value: totalRevenue });
      summarySheet.addRow({ label: "Tổng chiết khấu (VNĐ)", value: totalDiscount });

      // Style summary sheet
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getColumn("value").alignment = { horizontal: "right" };
      summarySheet.getRow(5).font = { bold: true, color: { argb: "FF4F46E5" } };
      summarySheet.getRow(5).getCell(2).numFmt = "#,##0";
      summarySheet.getRow(6).getCell(2).numFmt = "#,##0";
      summarySheet.getRow(4).getCell(2).numFmt = "#,##0";

      // Sheet 2: Chi tiết đơn hàng
      const detailSheet = workbook.addWorksheet("Chi tiết đơn hàng");
      detailSheet.columns = [
        { header: "Mã đơn hàng", key: "code", width: 15 },
        { header: "Ngày bán", key: "date", width: 20 },
        { header: "Khách hàng", key: "customer", width: 30 },
        { header: "Tổng tiền gốc", key: "subtotal", width: 15 },
        { header: "Giảm giá", key: "discount", width: 15 },
        { header: "Thanh toán", key: "final", width: 15 },
        { header: "Trạng thái", key: "status", width: 15 },
      ];

      // Style detail header
      const detailHeader = detailSheet.getRow(1);
      detailHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      detailHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" },
      };

      orders.forEach((order: any) => {
        const discountAmount = order.discountType === 'PERCENT'
          ? (order.totalAmount * (order.discountValue || 0)) / 100
          : (order.discountValue || 0);

        detailSheet.addRow({
          code: order.code,
          date: format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"),
          customer: order.customerName || "Khách lẻ",
          subtotal: order.totalAmount,
          discount: discountAmount,
          final: order.finalAmount,
          status: order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán',
        });
      });

      // Align columns
      ["subtotal", "discount", "final"].forEach(key => {
        detailSheet.getColumn(key).alignment = { horizontal: "right" };
        detailSheet.getColumn(key).numFmt = "#,##0";
      });

      // Export
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Bao_cao_doanh_thu_${format(date.from, "ddMMyy")}_${format(date.to, "ddMMyy")}.xlsx`);

      toast.success("Xuất báo cáo doanh thu thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xuất báo cáo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-2", className)}>
      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal h-10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                    {format(date.to, "dd/MM/yyyy", { locale: vi })}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy", { locale: vi })
                )
              ) : (
                <span>Chọn khoảng ngày</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={vi}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="h-10 px-5 font-bold shadow-sm"
      >
        <FileDown className="mr-2 h-4 w-4" />
        {isExporting ? "Đang xử lý..." : "Xuất báo cáo"}
      </Button>
    </div>
  );
}
