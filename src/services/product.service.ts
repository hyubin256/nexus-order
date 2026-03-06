import { prisma } from "../lib/prisma";

export class ProductService {
  /**
   * Tạo sản phẩm mới
   * - Tự động sinh mã SKU theo format 'PROD-YYYYMMDD-XXXX' (X là số tự tăng)
   * - Cho phép nhận mã SKU thủ công nếu người dùng cung cấp
   * - Lưu thông tin sản phẩm vào DB qua Prisma
   */
  static async createProduct(data: {
    name: string;
    sku?: string;
    image?: string;
    basePrice?: number;
    currentStock?: number;
  }) {
    let finalSku = data.sku;

    // 1. Tự động lấy SKU nếu người dùng không truyền vào
    if (!finalSku) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}${month}${day}`;

      // Tìm sản phẩm được tự động tạo cuối cùng trong ngày hôm nay
      const lastProduct = await prisma.product.findFirst({
        where: {
          sku: {
            startsWith: `PROD-${dateString}-`,
          },
        },
        orderBy: {
          sku: "desc",
        },
      });

      let nextSequence = 1;
      if (lastProduct) {
        // Lấy số cuối cùng từ SKU hiện tại (ví dụ: PROD-20231024-0005 -> 0005)
        const parts = lastProduct.sku.split("-");
        const lastSequenceStr = parts[parts.length - 1];
        if (lastSequenceStr && !isNaN(Number(lastSequenceStr))) {
          nextSequence = Number(lastSequenceStr) + 1;
        }
      }

      // Pad số tự tăng thành 4 chữ số, VD: 0001, 0012
      const sequenceString = String(nextSequence).padStart(4, "0");
      finalSku = `PROD-${dateString}-${sequenceString}`;
    }

    // 2. Lưu thông tin sản phẩm vào DB qua Prisma
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        sku: finalSku,
        image: data.image,
        basePrice: data.basePrice ?? 0,
        currentStock: data.currentStock ?? 0,
      },
    });

    return newProduct;
  }
}
