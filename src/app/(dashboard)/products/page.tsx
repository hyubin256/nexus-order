"use client";

import { useState } from "react";
import { PlusCircle, Search, FileDown } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductTable } from "@/components/products/product-table";
import { ProductModal } from "@/components/products/product-modal";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Clear editing state after a short delay to avoid flickering during transition
      setTimeout(() => setEditingProduct(null), 300);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: "1000", // Fetch a large number of products for export
      });

      const response = await fetch(`/api/products?${queryParams}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Lỗi khi lấy dữ liệu xuất file.");

      const products: Product[] = result.data;

      if (products.length === 0) {
        toast.error("Không có dữ liệu để xuất.");
        return;
      }

      // Create Workbook & Worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách sản phẩm");

      // Set columns
      worksheet.columns = [
        { header: "Mã SKU", key: "sku", width: 20 },
        { header: "Tên sản phẩm", key: "name", width: 45 },
        { header: "Giá bán (VNĐ)", key: "basePrice", width: 20 },
        { header: "Tồn kho", key: "currentStock", width: 15 },
        { header: "Ngày tạo", key: "createdAt", width: 20 },
      ];

      // Style Header Row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Primary index color
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // Add Data
      products.forEach((p) => {
        worksheet.addRow({
          sku: p.sku,
          name: p.name,
          basePrice: p.basePrice,
          currentStock: p.currentStock,
          createdAt: new Date(p.createdAt).toLocaleDateString("vi-VN"),
        });
      });

      // Auto-align numeric columns
      worksheet.getColumn("basePrice").alignment = { horizontal: "right" };
      worksheet.getColumn("currentStock").alignment = { horizontal: "right" };

      // Export file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Danh_sach_san_pham_${new Date().getTime()}.xlsx`);

      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xuất file Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportExcel} disabled={isExporting}>
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button onClick={handleOpenAddModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4 mt-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm tên sản phẩm hoặc SKU..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái tồn kho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="in_stock">Còn hàng</SelectItem>
                  <SelectItem value="low_stock">Sắp hết hàng</SelectItem>
                  <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProductTable
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            key={`table-${refreshKey}`}
            onEdit={handleOpenEditModal}
          />
        </CardContent>
      </Card>

      <ProductModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        onSuccess={handleRefresh}
        initialData={editingProduct}
      />
    </div>
  );
}
