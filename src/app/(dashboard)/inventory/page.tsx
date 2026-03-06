import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getImportReceipts } from "@/actions/inventory";
import { GetImportReceiptsOptions } from "@/actions/inventory";
import { InventoryFilter } from "@/components/inventory/inventory-filter";
import { InventoryPagination } from "@/components/inventory/inventory-pagination";
import { getSuppliers } from "@/actions/supplier";

interface InventoryPageProps {
  searchParams: {
    page?: string;
    from?: string;
    to?: string;
    supplierId?: string;
  };
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const page = parseInt(searchParams.page || "1");
  const options: GetImportReceiptsOptions = {
    page,
    limit: 10,
    startDate: searchParams.from,
    endDate: searchParams.to,
    supplierId: searchParams.supplierId,
  };

  const [receiptsResult, suppliersResult] = await Promise.all([
    getImportReceipts(options),
    getSuppliers(),
  ]);

  const receipts = receiptsResult.success ? (receiptsResult.data as any[]) : [];
  const metadata = receiptsResult.success ? receiptsResult.metadata : { totalPages: 0, page: 1 };
  const suppliers = (suppliersResult.success && suppliersResult.data) ? (suppliersResult.data as any[]) : [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý nhập kho</h2>
        <Link href="/inventory/import">
          <Button className="rounded-xl shadow-md h-10 px-6 font-bold">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới phiếu nhập
          </Button>
        </Link>
      </div>

      <Card className="rounded-2xl border bg-card shadow-premium overflow-hidden border-slate-200/60">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Danh sách phiếu nhập</CardTitle>
          <div className="mt-4">
            <InventoryFilter suppliers={suppliers} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="font-bold text-slate-600 h-12">Mã phiếu</TableHead>
                  <TableHead className="font-bold text-slate-600 h-12">Nhà cung cấp</TableHead>
                  <TableHead className="font-bold text-slate-600 h-12">Ngày nhập</TableHead>
                  <TableHead className="text-right font-bold text-slate-600 h-12">Tổng tiền</TableHead>
                  <TableHead className="font-bold text-slate-600 h-12">Người tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      Không tìm thấy phiếu nhập nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts?.map((receipt) => (
                    <TableRow key={receipt.id} className="cursor-pointer hover:bg-muted/20 transition-colors border-slate-100 group">
                      <TableCell className="font-medium h-14">
                        <Link href={`/inventory/${receipt.id}`} className="block w-full text-blue-600 font-bold group-hover:underline">
                          {receipt.code}
                        </Link>
                      </TableCell>
                      <TableCell className="h-14">
                        <Link href={`/inventory/${receipt.id}`} className="block w-full font-semibold text-slate-700">
                          {receipt.supplier?.name || "N/A"}
                        </Link>
                      </TableCell>
                      <TableCell className="h-14">
                        <Link href={`/inventory/${receipt.id}`} className="block w-full text-slate-600">
                          {format(new Date(receipt.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right h-14 font-bold text-emerald-600">
                        <Link href={`/inventory/${receipt.id}`} className="block w-full">
                          {formatCurrency(receipt.totalAmount)}
                        </Link>
                      </TableCell>
                      <TableCell className="h-14">
                        <Link href={`/inventory/${receipt.id}`} className="block w-full text-slate-500 text-sm">
                          {receipt.creator?.name || "Hệ thống"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {metadata && metadata.totalPages > 1 && (
            <div className="border-t border-slate-100 bg-muted/20">
              <InventoryPagination
                totalPages={metadata.totalPages}
                currentPage={metadata.page}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
