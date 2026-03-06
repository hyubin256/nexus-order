import { notFound } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, User, Calendar, Truck, CreditCard } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getImportReceiptById } from "@/actions/inventory";
import { ExportPDFButton } from "@/components/inventory/export-pdf-button";

interface ReceiptDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getImportReceiptById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const receipt = result.data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Chi tiết phiếu {receipt.code}</h2>
        </div>
        <ExportPDFButton receipt={receipt} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhà cung cấp</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{receipt.supplier?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {receipt.supplier?.phone || "Không có SĐT"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người nhập hàng</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{receipt.creator?.name || "Staff"}</div>
            <p className="text-xs text-muted-foreground">Nhân viên kho</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngày giờ nhập</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {format(new Date(receipt.createdAt), "dd/MM/yyyy", { locale: vi })}
            </div>
            <p className="text-xs text-muted-foreground">
              Lúc {format(new Date(receipt.createdAt), "HH:mm", { locale: vi })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tiền phiếu</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(receipt.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Thanh toán tiền mặt/chuyển khoản</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách mặt hàng</CardTitle>
          <CardDescription>Các sản phẩm đã được nhập kho đồng bộ theo mã phiếu này.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá nhập</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipt.inventoryLogs.map((log: any, index: number) => (
                  <TableRow key={log.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{log.product.name}</TableCell>
                    <TableCell className="font-mono text-xs">{log.product.sku}</TableCell>
                    <TableCell className="text-right">{log.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(log.importPrice)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(log.quantity * log.importPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
