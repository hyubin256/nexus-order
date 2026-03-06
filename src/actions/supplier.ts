"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        importReceipts: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to include a calculated field for convenience if needed, 
    // but the component can also do it.
    const suppliersWithTotal = suppliers.map(s => ({
      ...s,
      totalImportValue: s.importReceipts.reduce((acc, curr) => acc + curr.totalAmount, 0)
    }));

    return { success: true, data: suppliersWithTotal };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhà cung cấp:", error);
    return { success: false, error: "Không thể lấy danh sách nhà cung cấp" };
  }
}

export async function createSupplier(data: {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  taxCode?: string;
  address?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const supplier = await prisma.supplier.create({
      data,
    });
    revalidatePath("/partners");
    revalidatePath("/inventory");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Lỗi khi tạo nhà cung cấp:", error);
    return { success: false, error: "Không thể tạo nhà cung cấp" };
  }
}

export async function updateSupplier(id: string, data: any) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.supplier.update({
      where: { id },
      data,
    });
    revalidatePath("/partners");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Không thể cập nhật nhà cung cấp" };
  }
}

export async function deleteSupplier(id: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath("/partners");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Không thể xóa nhà cung cấp. Có thể nhà cung cấp này có liên quan đến các phiếu nhập trước đó." };
  }
}
