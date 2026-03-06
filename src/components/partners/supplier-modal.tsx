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
import { Textarea } from "@/components/ui/textarea";
import { createSupplier, updateSupplier } from "@/actions/supplier";
import { toast } from "sonner";
import { Loader2, Save, PlusCircle } from "lucide-react";

interface SupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: any;
  onSuccess?: (supplier: any) => void;
}

export function SupplierModal({ open, onOpenChange, supplier, onSuccess }: SupplierModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    taxCode: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contactName: supplier.contactName || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        taxCode: supplier.taxCode || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
      });
    } else {
      setFormData({
        name: "",
        contactName: "",
        phone: "",
        email: "",
        taxCode: "",
        address: "",
        notes: "",
      });
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let res;
      if (supplier) {
        res = await updateSupplier(supplier.id, formData);
      } else {
        res = await createSupplier(formData);
      }

      if (res.success) {
        toast.success(supplier ? "Đã cập nhật nhà cung cấp" : "Đã thêm nhà cung cấp mới");
        if (onSuccess && !supplier) {
          onSuccess((res as any).data);
        }
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
      <DialogContent className="sm:max-w-[550px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết của nhà cung cấp để quản lý nguồn hàng hiệu quả.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="s-name">Tên công ty / Nhà cung cấp</Label>
              <Input
                id="s-name"
                placeholder="Vd: Công ty TNHH Nexus"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-contact">Người liên hệ</Label>
              <Input
                id="s-contact"
                placeholder="Vd: Anh Nguyễn Văn B"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-tax">Mã số thuế</Label>
              <Input
                id="s-tax"
                placeholder="MST doanh nghiệp"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-phone">Số điện thoại</Label>
              <Input
                id="s-phone"
                placeholder="024 xxxx xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-email">Email</Label>
              <Input
                id="s-email"
                type="email"
                placeholder="contact@supplier.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="s-address">Địa chỉ văn phòng</Label>
              <Input
                id="s-address"
                placeholder="Địa chỉ trụ sở..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="s-notes">Ghi chú / Công nợ</Label>
              <Textarea
                id="s-notes"
                placeholder="Thông tin thêm về nhà cung cấp này..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl min-h-[80px]"
              />
            </div>
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
              ) : supplier ? (
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
