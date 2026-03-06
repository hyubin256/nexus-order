"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: products };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return { success: false, error: "Không thể lấy danh sách sản phẩm" };
  }
}

export async function updateProduct(id: string, data: {
  name: string;
  sku?: string;
  basePrice: number;
  currentStock: number;
  image?: string;
}) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        basePrice: data.basePrice,
        currentStock: data.currentStock,
        image: data.image,
      },
    });

    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error: any) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Mã SKU này đã tồn tại ở một sản phẩm khác." };
    }
    return { success: false, error: error.message || "Đã xảy ra lỗi khi cập nhật sản phẩm" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Kiểm tra xem sản phẩm có trong đơn hàng (OrderItem) không
    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: "Không thể xóa sản phẩm đã có trong đơn hàng. Vui lòng kiểm tra lại."
      };
    }

    // Kiểm tra xem sản phẩm có phiếu nhập hàng không
    const logCount = await prisma.inventoryLog.count({
      where: { productId: id },
    });

    if (logCount > 0) {
      return {
        success: false,
        error: "Sản phẩm này đã có dữ liệu nhập hàng/tồn kho. Bạn không thể xóa để đảm bảo tính toàn vẹn dữ liệu."
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    return { success: false, error: error.message || "Đã xảy ra lỗi khi xóa sản phẩm" };
  }
}
