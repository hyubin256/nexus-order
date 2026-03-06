"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function updateAvatar(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = formData.get("avatar") as File;
  if (!file) throw new Error("Không tìm thấy file");

  // Kiểm tra định dạng và dung lượng
  if (!file.type.startsWith("image/")) throw new Error("Chỉ hỗ trợ định dạng ảnh");
  if (file.size > 2 * 1024 * 1024) throw new Error("Dung lượng ảnh không quá 2MB");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "nexus-order-avatars" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  }) as any;

  await prisma.user.update({
    where: { id: session.user.id as string },
    data: { image: result.secure_url },
  });

  revalidatePath("/profile");
  return { success: true, url: result.secure_url };
}

export async function updateProfile(data: { name?: string; password?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id: session.user.id as string },
    data: updateData,
  });

  revalidatePath("/profile");
}

export async function createAdmin(data: { name: string; email: string; password?: string }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  const hashedPassword = await bcrypt.hash(data.password || "123456", 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  revalidatePath("/settings/users");
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  revalidatePath("/settings/users");
}

export async function getUsers() {
  const session = await auth();
  if ((session?.user as any)?.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}
