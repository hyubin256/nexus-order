"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdmin } from "@/actions/user";
import { toast } from "sonner";
import { Loader2, UserPlus, Mail, User, Lock } from "lucide-react";

export function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createAdmin(formData);
      toast.success("Đã tạo tài khoản Admin mới");
      setOpen(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error("Có lỗi xảy ra hoặc email đã tồn tại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold shadow-md hover:shadow-lg transition-all rounded-xl cursor-pointer">
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Thêm Admin mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản mới cho nhân viên quản trị. Mật khẩu mặc định là 123456 nếu để trống.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Tên hiển thị
            </Label>
            <Input
              id="create-name"
              placeholder="Vd: Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email đăng nhập
            </Label>
            <Input
              id="create-email"
              type="email"
              placeholder="vd: admin@nexusorder.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Mật khẩu
            </Label>
            <Input
              id="create-password"
              type="password"
              placeholder="Để trống để dùng mật khẩu mặc định: 123456"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="rounded-lg"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl font-semibold cursor-pointer"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl font-semibold min-w-[120px] cursor-pointer">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Xác nhận tạo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
