"use client";

import * as React from "react";
import { Camera, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAvatar } from "@/actions/user";
import { useSession } from "next-auth/react";

interface AvatarUploadProps {
  currentImage?: string | null;
  name?: string | null;
}

export function AvatarUpload({ currentImage, name }: AvatarUploadProps) {
  const { update } = useSession();
  const [preview, setPreview] = React.useState<string | null>(currentImage || null);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh (.jpg, .png)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa là 2MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await updateAvatar(formData);
      if (result.success) {
        await update({ image: result.url });
        toast.success("Cập nhật ảnh đại diện thành công!");
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật ảnh đại diện");
      setPreview(currentImage || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
          <AvatarImage src={preview || ""} className="object-cover" />
          <AvatarFallback className="bg-muted text-4xl">
            {name ? name.substring(0, 2).toUpperCase() : <User className="h-16 w-16" />}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full shadow-lg border-2 border-background group-hover:scale-110 transition-transform"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Chấp nhận .jpg, .png. Tối đa 2MB
        </p>
      </div>
    </div>
  );
}
