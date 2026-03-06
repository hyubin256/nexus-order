import { getOrders, GetOrdersOptions } from "@/actions/order";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, PlusCircle, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";
import { OrderReportExport } from "@/components/sales/order-report-export";
import { OrderFilter } from "@/components/sales/order-filter";
import { OrderPagination } from "@/components/sales/order-pagination";

interface OrdersPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    from?: string;
    to?: string;
    status?: string;
    paymentMethod?: string;
    minAmount?: string;
    maxAmount?: string;
    search?: string;
  };
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");

  const options: GetOrdersOptions = {
    page,
    limit,
    startDate: searchParams.from,
    endDate: searchParams.to,
    status: searchParams.status as any,
    paymentMethod: searchParams.paymentMethod as any,
    minAmount: searchParams.minAmount ? parseFloat(searchParams.minAmount) : undefined,
    maxAmount: searchParams.maxAmount ? parseFloat(searchParams.maxAmount) : undefined,
    search: searchParams.search,
  };

  const result = await getOrders(options);
  const orders = result.success ? (result.data as any[]) : [];
  const metadata = result.success ? result.metadata : { totalPages: 0, page: 1 };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none px-2.5 font-bold">Đã thanh toán</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="text-amber-500 border-amber-500 px-2.5 font-bold">Chờ xử lý</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="px-2.5 font-bold">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary" className="px-2.5 font-bold">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return (
          <div className="flex items-center text-slate-600">
            <Banknote className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium">Tiền mặt</span>
          </div>
        );
      case "TRANSFER":
        return (
          <div className="flex items-center text-slate-600">
            <CreditCard className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium">Chuyển khoản</span>
          </div>
        );
      default:
        return <span className="text-xs font-medium text-slate-500">{method}</span>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Doanh thu & Đơn hàng</h2>
        <Link href="/sales/pos">
          <Button className="rounded-xl shadow-lg h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="mr-2 h-5 w-5" />
            Tạo đơn hàng mới
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold mb-4 text-slate-800">Trích xuất báo cáo doanh thu</h3>
        <OrderReportExport />
      </div>

      <Card className="rounded-2xl border bg-card shadow-premium overflow-hidden border-slate-200/60">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Lịch sử giao dịch</CardTitle>
          <div className="mt-4">
            <OrderFilter />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="w-[150px] font-bold text-slate-600 h-12 pl-6">Mã đơn hàng</TableHead>
                  <TableHead className="font-bold text-slate-600 h-12">Ngày bán</TableHead>
                  <TableHead className="font-bold text-slate-600 h-12">Khách hàng</TableHead>
                  <TableHead className="font-bold text-slate-600 h-12">Thanh toán</TableHead>
                  <TableHead className="text-right font-bold text-slate-600 h-12">Tổng tiền</TableHead>
                  <TableHead className="text-center font-bold text-slate-600 h-12">Trạng thái</TableHead>
                  <TableHead className="w-[80px] text-right pr-6 h-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground italic">
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order: any) => (
                    <TableRow key={order.id} className="group hover:bg-muted/20 transition-colors border-slate-100">
                      <TableCell className="font-mono text-sm font-bold text-indigo-600 pl-6 h-14">
                        <Link href={`/sales/orders/${order.id}`} className="hover:underline">
                          {order.code}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm h-14 text-slate-600">
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </TableCell>
                      <TableCell className="h-14">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{order.customerName || "Khách lẻ"}</span>
                          {order.customer?.phone && (
                            <span className="text-[10px] text-muted-foreground">{order.customer.phone}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="h-14">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-800 h-14">
                        {formatCurrency(order.finalAmount)}
                      </TableCell>
                      <TableCell className="text-center h-14">
                        {getStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="text-right pr-6 h-14">
                        <Link href={`/sales/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 transition-colors group-hover:text-indigo-600">
                            <Eye className="h-4.5 w-4.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {metadata && metadata.totalPages > 1 && (
            <div className="border-t border-slate-100 bg-muted/10">
              <OrderPagination
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
