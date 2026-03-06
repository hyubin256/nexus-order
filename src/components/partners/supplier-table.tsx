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
import {
  Search,
  Truck,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  UserCircle,
  Hash,
  MoreVertical,
  FileText,
  FileDown
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { SupplierModal } from "@/components/partners/supplier-modal";
import { deleteSupplier } from "@/actions/supplier";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SupplierTableProps {
  initialData: any[];
}

export function SupplierTable({ initialData }: SupplierTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredData = initialData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm)) ||
      (item.taxCode && item.taxCode.includes(searchTerm))
  );

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách nhà cung cấp");

      worksheet.columns = [
        { header: "Tên nhà cung cấp", key: "name", width: 30 },
        { header: "Mã số thuế", key: "taxCode", width: 15 },
        { header: "Người liên hệ", key: "contact", width: 25 },
        { header: "Số điện thoại", key: "phone", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Địa chỉ", key: "address", width: 40 },
        { header: "Tổng giá trị nhập (VNĐ)", key: "total", width: 20 },
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
          taxCode: item.taxCode || "",
          contact: item.contactName || "",
          phone: item.phone || "",
          email: item.email || "",
          address: item.address || "",
          total: item.totalImportValue || 0,
        });
      });

      // Align columns
      worksheet.getColumn("total").alignment = { horizontal: "right" };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Danh_sach_nha_cung_cap_${new Date().getTime()}.xlsx`);
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;
    try {
      const res = await deleteSupplier(id);
      if (res.success) {
        toast.success("Đã xóa nhà cung cấp");
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
            placeholder="Tìm theo tên, SĐT hoặc MST..."
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
              setSelectedSupplier(null);
              setIsModalOpen(true);
            }}
            className="h-10 px-5 font-bold shadow-sm rounded-xl"
          >
            <Truck className="mr-2 h-4 w-4" />
            Thêm nhà cung cấp
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-premium overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-bold">Nhà cung cấp</TableHead>
              <TableHead className="font-bold">Mã số thuế</TableHead>
              <TableHead className="font-bold">Người liên hệ</TableHead>
              <TableHead className="font-bold">Liên hệ & Địa chỉ</TableHead>
              <TableHead className="w-[100px] text-right font-bold pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy nhà cung cấp nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{supplier.name}</span>
                      {supplier.notes && (
                        <div className="flex items-center text-[11px] text-muted-foreground mt-1 bg-muted/50 w-fit px-1.5 py-0.5 rounded border border-muted-foreground/10 italic">
                          <FileText className="mr-1 h-2.5 w-2.5" />
                          Ghi chú: {supplier.notes.length > 30 ? supplier.notes.substring(0, 30) + "..." : supplier.notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {supplier.taxCode ? (
                      <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Hash className="mr-1.5 h-3.5 w-3.5" />
                        {supplier.taxCode}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Trống</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <UserCircle className="mr-2 h-4 w-4 text-primary/60" />
                      <span className="font-medium">{supplier.contactName || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1.5 py-1">
                      <div className="flex items-center text-xs">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">{supplier.phone || "N/A"}</span>
                      </div>
                      {supplier.email && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="mr-2 h-3 w-3 shrink-0" />
                          {supplier.email}
                        </div>
                      )}
                      <div className="flex items-start text-xs text-muted-foreground">
                        <MapPin className="mr-2 h-3 w-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{supplier.address || "Chưa có địa chỉ"}</span>
                      </div>
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
                            setSelectedSupplier(supplier);
                            setIsModalOpen(true);
                          }}
                          className="cursor-pointer rounded-lg py-2"
                        >
                          <Edit className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(supplier.id)}
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

      <SupplierModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        supplier={selectedSupplier}
      />
    </div>
  );
}
