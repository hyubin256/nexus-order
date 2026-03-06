"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadPaymentBill(formData: FormData) {
  try {
    const file = formData.get("bill") as File;
    if (!file) throw new Error("Không tìm thấy file");

    if (!file.type.startsWith("image/")) throw new Error("Chỉ hỗ trợ định dạng ảnh");
    if (file.size > 5 * 1024 * 1024) throw new Error("Dung lượng ảnh không quá 5MB");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "nexus-order-bills" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    return { success: true, url: result.secure_url };
  } catch (error: any) {
    console.error("Lỗi upload bill:", error);
    return { success: false, error: error.message || "Không thể tải lên hình ảnh" };
  }
}
