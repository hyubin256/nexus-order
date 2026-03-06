"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  MoreVertical,
  FileDown
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { CustomerModal } from "@/components/partners/customer-modal";
import { deleteCustomer } from "@/actions/customer";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomerTableProps {
  initialData: any[];
}

export function CustomerTable({ initialData }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredData = initialData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm)
  );

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách khách hàng");

      worksheet.columns = [
        { header: "Tên khách hàng", key: "name", width: 30 },
        { header: "Số điện thoại", key: "phone", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Địa chỉ", key: "address", width: 40 },
        { header: "Mã số thuế", key: "taxCode", width: 15 },
        { header: "Hạng", key: "grade", width: 10 },
        { header: "Tổng chi tiêu (VNĐ)", key: "total", width: 20 },
      ];

      // Style header
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // Add data
      filteredData.forEach((item) => {
        worksheet.addRow({
          name: item.name,
          phone: item.phone,
          email: item.email || "",
          address: item.address || "",
          taxCode: item.taxCode || "",
          grade: item.grade,
          total: item.totalSpending,
        });
      });

      // Align columns
      worksheet.getColumn("total").alignment = { horizontal: "right" };
      worksheet.getColumn("grade").alignment = { horizontal: "center" };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Danh_sach_khach_hang_${new Date().getTime()}.xlsx`);
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
    try {
      const res = await deleteCustomer(id);
      if (res.success) {
        toast.success("Đã xóa khách hàng");
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="h-10 px-5 font-bold shadow-sm rounded-xl border-slate-200"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          <Button
            onClick={() => {
              setSelectedCustomer(null);
              setIsModalOpen(true);
            }}
            className="h-10 px-5 font-bold shadow-sm rounded-xl"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-premium overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-bold">Khách hàng</TableHead>
              <TableHead className="font-bold">Liên hệ</TableHead>
              <TableHead className="font-bold">Địa chỉ</TableHead>
              <TableHead className="font-bold">Hạng</TableHead>
              <TableHead className="font-bold">Tổng chi tiêu</TableHead>
              <TableHead className="w-[100px] text-right font-bold pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy khách hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{customer.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">ID: {customer.id.substring(0, 8)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm font-medium">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="mr-2 h-3 w-3" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-start text-sm text-balance">
                      <MapPin className="mr-2 h-3 w-3 mt-1 shrink-0 text-muted-foreground" />
                      {customer.address || <span className="text-muted-foreground italic">Chưa có địa chỉ</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.grade === "VIP" ? "default" : "outline"}
                      className={customer.grade === "VIP" ? "bg-amber-500 hover:bg-amber-600 border-none px-2.5 font-bold" : "px-2.5 font-semibold text-muted-foreground border-muted-foreground/30"}
                    >
                      {customer.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                      {customer.totalSpending.toLocaleString("vi-VN")} đ
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-1">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsModalOpen(true);
                          }}
                          className="cursor-pointer rounded-lg py-2"
                        >
                          <Edit className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(customer.id)}
                          className="cursor-pointer rounded-lg py-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        customer={selectedCustomer}
      />
    </div>
  );
}
