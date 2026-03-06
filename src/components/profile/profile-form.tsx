"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/actions/user";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface ProfileFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        name,
        ...(password ? { password } : {}),
      });
      toast.success("Cập nhật hồ sơ thành công");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={user.email || ""}
          disabled
          className="bg-muted font-medium"
        />
        <p className="text-[12px] text-muted-foreground italic">Email không thể thay đổi</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Họ và tên</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập họ và tên"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu mới (Để trống nếu không đổi)</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button type="submit" className="w-full md:w-max px-8 font-semibold" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang lưu...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Lưu thay đổi
          </>
        )}
      </Button>
    </form>
  );
}
