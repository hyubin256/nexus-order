"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPOSOrder(data: {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  taxCode?: string;
  customerType?: "INDIVIDUAL" | "COMPANY";
  items: {
    productId: string;
    quantity: number;
    price: number;
    discountAtSale?: number;
  }[];
  totalAmount: number;
  discountValue: number;
  finalAmount: number;
  paymentMethod?: "CASH" | "TRANSFER";
  transactionId?: string;
  paymentImage?: string;
  paymentStatus?: "PAID" | "PENDING";
}) {
  try {
    // 1. Dùng transaction để đảm bảo tính toàn vẹn dữ liệu
    const result = await prisma.$transaction(async (tx) => {
      // 2. Tạo mã đơn hàng tự động (ví dụ: POS-2024-0001)
      const count = await tx.order.count();
      const code = `POS-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

      // 3. Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          code,
          customerId: data.customerId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          taxCode: data.taxCode,
          customerType: data.customerType || "INDIVIDUAL",
          totalAmount: data.totalAmount,
          discountValue: data.discountValue,
          finalAmount: data.finalAmount,
          paymentStatus: data.paymentStatus || "PAID",
          paymentMethod: data.paymentMethod || "CASH",
          transactionId: data.transactionId,
          paymentImage: data.paymentImage,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtSale: item.price,
              discountAtSale: item.discountAtSale || 0,
            })),
          },
        },
      });

      // 4. Trừ tồn kho và lưu log (nếu cần)
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.currentStock < item.quantity) {
          throw new Error(`Sản phẩm ${product?.name || "không xác định"} không đủ tồn kho`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 5. Cập nhật chi tiêu khách hàng và thông tin khách hàng (Bảng Partner)
      if (data.customerPhone) {
        await tx.customer.upsert({
          where: { phone: data.customerPhone },
          update: {
            name: data.customerName || "Khách lẻ",
            address: data.customerAddress,
            taxCode: data.taxCode,
            type: data.customerType || "INDIVIDUAL",
            totalSpending: {
              increment: data.finalAmount,
            },
          },
          create: {
            phone: data.customerPhone,
            name: data.customerName || "Khách lẻ",
            address: data.customerAddress,
            taxCode: data.taxCode,
            type: data.customerType || "INDIVIDUAL",
            totalSpending: data.finalAmount,
          },
        });
      }

      return order;
    });

    revalidatePath("/");
    revalidatePath("/sales");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Lỗi POS:", error);
    return { success: false, error: error.message || "Đã xảy ra lỗi khi tạo đơn hàng" };
  }
}
