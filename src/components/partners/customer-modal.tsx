"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCustomer, updateCustomer } from "@/actions/customer";
import { toast } from "sonner";
import { Loader2, PlusCircle, Save } from "lucide-react";

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any;
}

export function CustomerModal({ open, onOpenChange, customer }: CustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    grade: "NORMAL",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        grade: customer.grade || "NORMAL",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        grade: "NORMAL",
      });
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let res;
      if (customer) {
        res = await updateCustomer(customer.id, formData);
      } else {
        res = await createCustomer(formData as any);
      }

      if (res.success) {
        toast.success(customer ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng mới");
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin khách hàng vào các trường bên dưới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên khách hàng</Label>
            <Input
              id="name"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại (ID chính)</Label>
            <Input
              id="phone"
              placeholder="09xx xxx xxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (Tùy chọn)</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              placeholder="Số nhà, đường, quận, thành phố..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Hạng thành viên</Label>
            <Select
              value={formData.grade}
              onValueChange={(value) => setFormData({ ...formData, grade: value })}
            >
              <SelectTrigger id="grade" className="rounded-xl h-11">
                <SelectValue placeholder="Chọn hạng" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="NORMAL">NORMAL</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 h-11 font-semibold"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl px-8 h-11 font-bold shadow-md min-w-[140px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : customer ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cập nhật
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Thêm mới
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
