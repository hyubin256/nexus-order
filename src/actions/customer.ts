"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: customers };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error);
    return { success: false, error: "Không thể lấy danh sách khách hàng" };
  }
}

export async function getCustomerByPhone(phone: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });
    return { success: true, data: customer };
  } catch (error) {
    return { success: false, error: "Không thể tìm khách hàng" };
  }
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  grade?: "NORMAL" | "VIP";
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const customer = await prisma.customer.create({
      data,
    });
    revalidatePath("/partners");
    return { success: true, data: customer };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Số điện thoại đã tồn tại trong hệ thống" };
    }
    return { success: false, error: "Không thể tạo khách hàng" };
  }
}

export async function updateCustomer(id: string, data: any) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.customer.update({
      where: { id },
      data,
    });
    revalidatePath("/partners");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Không thể cập nhật khách hàng" };
  }
}

export async function deleteCustomer(id: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.customer.delete({
      where: { id },
    });
    revalidatePath("/partners");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Không thể xóa khách hàng" };
  }
}
