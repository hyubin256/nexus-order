"use server";

import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachDayOfInterval
} from "date-fns";

export async function getDashboardStats(filter: string = "today") {
  try {
    let startDate: Date;
    let endDate: Date = new Date();

    switch (filter) {
      case "week":
        startDate = startOfDay(subDays(new Date(), 6));
        break;
      case "month":
        startDate = startOfMonth(new Date());
        break;
      case "lastMonth":
        const lastMonth = subMonths(new Date(), 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "today":
      default:
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
        break;
    }

    // 1. Fetch Stats
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: "PAID",
      },
      include: {
        items: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);
    const totalItemsSold = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Get previous period stats for comparison (optional, but nice)
    // For simplicity, let's just focus on current stats first as requested

    // 2. Fetch Low Stock Products (doesn't depend on time filter, but shown on dashboard)
    const lowStockCount = await prisma.product.count({
      where: {
        currentStock: {
          lt: 5,
        },
      },
    });

    // 3. Chart Data (Daily revenue)
    let chartStartDate = startDate;
    if (filter === "today") {
      chartStartDate = subDays(startDate, 6); // Show last 7 days even if today is selected
    }

    const chartOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: chartStartDate,
          lte: endDate,
        },
        paymentStatus: "PAID",
      },
    });

    const days = eachDayOfInterval({
      start: chartStartDate,
      end: endDate,
    });

    const revenueData = days.map((day) => {
      const dateStr = format(day, "dd/MM");
      const dayRevenue = chartOrders
        .filter((order) => format(order.createdAt, "dd/MM") === dateStr)
        .reduce((sum, order) => sum + order.finalAmount, 0);

      return {
        date: dateStr,
        revenue: dayRevenue,
      };
    });

    // 4. Top Products
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: "PAID",
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          id: product?.id || "",
          name: product?.name || "N/A",
          sales: item._sum.quantity || 0,
          image: product?.image || "",
          category: "Sản phẩm", // Category not in schema yet? Check.
        };
      })
    );

    return {
      success: true,
      data: {
        stats: {
          totalItemsSold,
          totalRevenue,
          lowStockCount,
        },
        revenueData,
        topProducts,
      },
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { success: false, error: "Lỗi khi lấy dữ liệu dashboard" };
  }
}
