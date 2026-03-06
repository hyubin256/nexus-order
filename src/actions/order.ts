"use server";

import { prisma } from "@/lib/prisma";

import { PaymentStatus, PaymentMethod } from "@prisma/client";

export type GetOrdersOptions = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
};

export async function getOrders(options: GetOrdersOptions = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      status,
      paymentMethod,
      minAmount,
      maxAmount,
      search
    } = options;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (status && status !== ("ALL" as any)) {
      where.paymentStatus = status;
    }

    if (paymentMethod && paymentMethod !== ("ALL" as any)) {
      where.paymentMethod = paymentMethod;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.finalAmount = {};
      if (minAmount !== undefined) where.finalAmount.gte = minAmount;
      if (maxAmount !== undefined) where.finalAmount.lte = maxAmount;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              name: true,
              phone: true,
            }
          }
        }
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: orders,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    return { success: false, error: error.message || "Không thể lấy danh sách đơn hàng" };
  }
}

export async function getOrderDetail(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Không tìm thấy đơn hàng" };
    }

    return { success: true, data: order };
  } catch (error: any) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    return { success: false, error: "Không thể lấy chi tiết đơn hàng" };
  }
}
