"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleUserStatus } from "@/actions/user";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, ShieldCheck, UserMinus, UserCheck, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface UserTableProps {
  users: any[];
  currentUser: any;
}

export function UserTable({ users, currentUser }: UserTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setLoadingId(userId);
      await toggleUserStatus(userId, !currentStatus);
      toast.success(currentStatus ? "Đã khóa tài khoản" : "Đã kích hoạt tài khoản");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[250px] font-bold">Người dùng</TableHead>
            <TableHead className="font-bold">Vai trò</TableHead>
            <TableHead className="font-bold">Ngày tạo</TableHead>
            <TableHead className="font-bold">Trạng thái</TableHead>
            <TableHead className="text-right font-bold pr-6">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{user.name || "N/A"}</span>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <Mail className="h-3 w-3 mr-1" />
                    {user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ShieldCheck className={cn(
                    "h-4 w-4",
                    user.role === "SUPER_ADMIN" ? "text-amber-500" : "text-blue-500"
                  )} />
                  <span className="text-sm font-medium">{user.role}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: vi })}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.isActive ? "default" : "destructive"}
                  className={cn(
                    "font-medium",
                    user.isActive ? "bg-emerald-500 hover:bg-emerald-600 border-none px-2.5" : "px-2.5"
                  )}
                >
                  {user.isActive ? "Hoạt động" : "Đã khóa"}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6">
                {user.id !== currentUser.id && user.role !== "SUPER_ADMIN" && (
                  <Button
                    variant={user.isActive ? "outline" : "default"}
                    size="sm"
                    className={cn(
                      "h-8 px-3 rounded-lg text-xs font-semibold",
                      user.isActive && "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    )}
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    disabled={loadingId === user.id}
                  >
                    {loadingId === user.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : user.isActive ? (
                      <>
                        <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                        Khóa
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                        Mở khóa
                      </>
                    )}
                  </Button>
                )}
                {user.id === currentUser.id && (
                  <span className="text-xs italic text-muted-foreground">Tài khoản này</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
