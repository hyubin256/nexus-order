"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Package,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useSearchParams } from "next/navigation";
import { getDashboardStats } from "@/actions/dashboard";
import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function DashboardContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "today";

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getDashboardStats(filter);
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    };

    fetchData();
  }, [filter]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Sản phẩm bán ra",
      value: `${data?.stats.totalItemsSold || 0} món`,
      icon: ShoppingBag,
      description: filter === "today" ? "Trong hôm nay" :
        filter === "week" ? "Trong 7 ngày qua" :
          filter === "month" ? "Trong tháng này" : "Trong tháng trước",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Doanh thu",
      value: formatCurrency(data?.stats.totalRevenue || 0),
      icon: DollarSign,
      description: filter === "today" ? "Trong hôm nay" :
        filter === "week" ? "Trong 7 ngày qua" :
          filter === "month" ? "Trong tháng này" : "Trong tháng trước",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Cảnh báo kho",
      value: `${data?.stats.lowStockCount || 0} sản phẩm`,
      icon: AlertTriangle,
      description: "Tồn kho ít hơn 5",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground">
            {filter === "today" ? "Tình hình kinh doanh của bạn hôm nay." : "Phân tích hiệu quả kinh doanh của bạn."}
          </p>
        </div>
        <DashboardFilter />
      </div>

      {loading && data && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang cập nhật dữ liệu...
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-full`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {stat.label !== "Cảnh báo kho" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Revenue Chart */}
        <Card className="md:col-span-12 lg:col-span-8 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Xu hướng doanh thu</CardTitle>
                <CardDescription>
                  {filter === "today" ? "Biểu đồ doanh thu 7 ngày gần nhất" : "Biểu đồ doanh thu theo giai đoạn đã chọn"}
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                data={data?.revenueData || []}
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  hide
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Right Column: Top Selling Products */}
        <Card className="md:col-span-12 lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Sản phẩm bán chạy
            </CardTitle>
            <CardDescription>Top 5 sản phẩm hiệu quả nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(data?.topProducts && data.topProducts.length > 0) ? (
                data.topProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center gap-4 group">
                    <Avatar className="h-12 w-12 rounded-lg border">
                      <AvatarImage src={product.image} alt={product.name} className="object-cover" />
                      <AvatarFallback className="rounded-lg">{product.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors cursor-pointer">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{product.sales}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Đã bán</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <Package className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Chưa có dữ liệu bán hàng trong giai đoạn này</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-primary hover:text-primary hover:bg-primary/5 group" asChild>
              <a href="/products">
                Xem tất cả sản phẩm
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
