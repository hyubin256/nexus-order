import { prisma } from "../lib/prisma";

export class InventoryService {
  /**
   * Nhập kho (Import Stock)
   * Tạo bản ghi InventoryLog và đồng thời cộng dồn currentStock 
   * trong bảng Product theo transaction
   */
  static async importStock(data: {
    productId: string;
    quantity: number;
    importPrice: number;
    providerId?: string;
  }) {
    if (data.quantity <= 0) {
      throw new Error("Số lượng nhập phải lớn hơn 0");
    }

    // Thực hiện transaction để đảm bảo toàn vẹn dữ liệu
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi lịch sử nhập hàng (InventoryLog)
      const inventoryLog = await tx.inventoryLog.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          importPrice: data.importPrice,
          providerId: data.providerId,
        },
      });

      // 2. Cập nhật số lượng tồn kho (currentStock) của Product liên quan
      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: {
          currentStock: {
            increment: data.quantity,
          },
        },
      });

      return {
        inventoryLog,
        product: updatedProduct,
      };
    });

    return result;
  }
}
