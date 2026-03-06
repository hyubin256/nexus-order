"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";

export type ImportStockInput = {
  productId: string;
  quantity: number;
  importPrice: number;
};

export async function importBatchStockAction(
  supplierId: string | null,
  importDate: string,
  importCode: string,
  items: ImportStockInput[]
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
    }

    if (!items || items.length === 0) {
      throw new Error("Phải có ít nhất một sản phẩm hợp lệ");
    }

    // Tính tổng tiền phiếu nhập
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.importPrice, 0);

    // Wrap toàn bộ trong 1 transaction an toàn
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo phiếu nhập (ImportReceipt)
      const receipt = await tx.importReceipt.create({
        data: {
          code: importCode,
          providerId: supplierId,
          totalAmount: totalAmount,
          creatorId: userId,
          createdAt: new Date(importDate),
        },
      });

      const logs = [];
      const updatedProducts = [];

      for (const item of items) {
        if (item.quantity <= 0) {
          throw new Error("Số lượng nhập phải lớn hơn 0");
        }

        // 2. Tạo bản ghi lịch sử gắn với phiếu nhập
        const log = await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            importPrice: item.importPrice,
            providerId: supplierId,
            receiptId: receipt.id,
            createdAt: new Date(importDate),
          },
        });
        logs.push(log);

        // 3. Cập nhật tồn kho sản phẩm
        const product = await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });
        updatedProducts.push(product);
      }

      return { receipt, logs, updatedProducts };
    });

    // Revalidate lại các trang hiển thị sản phẩm và kho
    revalidatePath("/products");
    revalidatePath("/inventory");

    return {
      success: true,
      count: result.logs.length,
      receiptId: result.receipt.id
    };
  } catch (error: any) {
    console.error("Lỗi khi nhập kho:", error);
    return { success: false, error: error.message || "Đã xảy ra lỗi hệ thống" };
  }
}

export type GetImportReceiptsOptions = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  supplierId?: string;
};

export async function getImportReceipts(options: GetImportReceiptsOptions = {}) {
  try {
    const { page = 1, limit = 10, startDate, endDate, supplierId } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Cài đặt giờ kết thúc là cuối ngày
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (supplierId && supplierId !== "all") {
      where.providerId = supplierId;
    }

    const [receipts, total] = await Promise.all([
      prisma.importReceipt.findMany({
        where,
        include: {
          supplier: true,
          creator: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.importReceipt.count({ where }),
    ]);

    return {
      success: true,
      data: receipts,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phiếu nhập:", error);
    return { success: false, error: "Không thể lấy danh sách phiếu nhập" };
  }
}

export async function getImportReceiptById(id: string) {
  try {
    const receipt = await prisma.importReceipt.findUnique({
      where: { id },
      include: {
        supplier: true,
        creator: {
          select: {
            name: true,
          }
        },
        inventoryLogs: {
          include: {
            product: true,
          }
        }
      }
    });

    return { success: true, data: receipt };
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phiếu nhập:", error);
    return { success: false, error: "Không thể lấy chi tiết phiếu nhập" };
  }
}
