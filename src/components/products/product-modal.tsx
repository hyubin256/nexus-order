"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2, UploadCloud } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { updateProduct } from "@/actions/product";
import { Product } from "@/types/product";

const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên sản phẩm phải có ít nhất 2 ký tự.",
  }),
  sku: z.string().optional(),
  basePrice: z.number().min(0, {
    message: "Giá bán không được âm.",
  }),
  currentStock: z.number().min(0, {
    message: "Tồn kho không được âm.",
  }),
  image: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Product | null;
}

export function ProductModal({ open, onOpenChange, onSuccess, initialData }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isEditing = !!initialData;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      basePrice: initialData?.basePrice || 0,
      currentStock: initialData?.currentStock || 0,
      image: initialData?.image || "",
    },
  });

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        sku: initialData.sku,
        basePrice: initialData.basePrice,
        currentStock: initialData.currentStock,
        image: initialData.image || "",
      });
      setPreviewImage(initialData.image || null);
    } else {
      form.reset({
        name: "",
        sku: "",
        basePrice: 0,
        currentStock: 0,
        image: "",
      });
      setPreviewImage(null);
    }
  }, [initialData, form]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      const payload: any = {
        name: data.name,
        basePrice: data.basePrice,
        currentStock: data.currentStock,
        sku: data.sku,
        image: data.image,
      };

      if (isEditing && initialData) {
        const result = await updateProduct(initialData.id, payload);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Có lỗi xảy ra");
        }
        toast.success("Thêm sản phẩm thành công!");
      }

      form.reset();
      setPreviewImage(null);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải ảnh thực tế lên Cloudinary qua API Route
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Không thể tải ảnh lên");
        }

        const data = await response.json();

        setPreviewImage(data.url);
        form.setValue("image", data.url);
        toast.success("Đã tải ảnh lên thành công!");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrencyInput = (value: number) => {
    if (isNaN(value) || value === 0) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin chi tiết của sản phẩm."
              : "Điền thông tin chi tiết sản phẩm. Bỏ trống SKU để hệ thống tự động tạo mã."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Ảnh sản phẩm */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted transition-colors hover:bg-muted/50">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <UploadCloud className="mb-2 h-8 w-8" />
                    <span className="text-xs">Tải ảnh lên</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Áo thun nam Cổ tròn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã sản phẩm (SKU)</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="Để trống tự tạo..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          field.onChange(""); // Clear value to force next submit auto-generate at server
                          toast.info("SKU sẽ được hệ thống tự động tạo khi lưu.");
                        }}
                        title="Tự động tạo mã"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Nhập mã tự tạo hoạch để trống
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá bán (VNĐ)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="0"
                          // Hiển thị format tiền tệ
                          value={formatCurrencyInput(field.value) || field.value}
                          onChange={(e) => {
                            // Chỉ lấy số từ input
                            const rawValue = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(Number(rawValue));
                          }}
                          className="pr-12 text-right font-mono"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                          đ
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tồn kho ban đầu</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Số lượng tồn khi tạo mới</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu sản phẩm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
