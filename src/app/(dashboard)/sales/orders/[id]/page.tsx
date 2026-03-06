import { getOrderDetail } from "@/actions/order";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExportOrderPDFButton } from "@/components/sales/export-pdf-button";
import { CreditCard, Banknote, Hash, Image as ImageIcon, ExternalLink, Calendar, User as UserIcon } from "lucide-react";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getOrderDetail(id);

  if (!result.success || !result.data) {
    return notFound();
  }

  const order = result.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-1">Đã thanh toán</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="text-amber-500 border-amber-500 px-4 py-1">Chờ xử lý</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive" className="px-4 py-1">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary" className="px-4 py-1">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/sales/orders">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng</h2>
          <CardDescription>Mã đơn: {order.code}</CardDescription>
        </div>
        <div className="ml-auto flex gap-2">
          <ExportOrderPDFButton order={order} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Thông tin chính */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl">Danh sách mặt hàng</CardTitle>
              <CardDescription>Tổng số {order.items.length} sản phẩm</CardDescription>
            </div>
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[80px]">Hình ảnh</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                            No Item
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{item.product.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.priceAtSale)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.quantity * item.priceAtSale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tóm tắt đơn hàng */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  Khách hàng:
                </span>
                <span className="font-semibold">{order.customerName || "Khách lẻ"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Thời gian:
                </span>
                <span className="font-semibold">{format(new Date(order.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  {order.paymentMethod === "CASH" ? <Banknote className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                  Thanh toán:
                </span>
                <span className="font-semibold">{order.paymentMethod === "CASH" ? "Tiền mặt" : "Chuyển khoản"}</span>
              </div>
              <div className="flex justify-center pt-2">
                {getStatusBadge(order.paymentStatus)}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính (chưa KM):</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                {(order.discountValue || 0) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Chiết khấu ({order.discountType === 'PERCENT' ? `${order.discountValue}%` : 'Giảm tiền'}):</span>
                    <span>- {order.discountType === 'PERCENT'
                      ? formatCurrency((order.totalAmount * (order.discountValue || 0)) / 100)
                      : formatCurrency(order.discountValue || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t">
                  <span className="text-lg font-bold">Tổng thanh toán:</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(order.finalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.paymentMethod === "TRANSFER" && (
            <Card className="border-indigo-100 bg-indigo-50/20 overflow-hidden">
              <CardHeader className="pb-3 border-b border-indigo-50">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
                  <CreditCard className="h-5 w-5" />
                  Chi tiết chuyển khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Mã giao dịch
                  </span>
                  <p className="text-sm font-mono font-bold text-indigo-900 bg-white p-2 rounded-lg border border-indigo-100">
                    {order.transactionId || "Không có mã giao dịch"}
                  </p>
                </div>

                {order.paymentImage && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      Hình ảnh Bill
                    </span>
                    <div className="relative group rounded-xl overflow-hidden border border-indigo-200 bg-white">
                      <img
                        src={order.paymentImage}
                        alt="Bill thanh toán"
                        className="w-full h-auto object-contain max-h-[300px] transition-transform group-hover:scale-[1.02]"
                      />
                      <a
                        href={order.paymentImage}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-sm"
                      >
                        <ExternalLink className="h-4.5 w-4.5" />
                        Xem ảnh gốc
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ghi chú & Khác</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                {order.paymentMethod === "TRANSFER" && !order.paymentImage
                  ? "Chưa có hình ảnh minh họa cho giao dịch này."
                  : "Không có ghi chú cho đơn hàng này."
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
