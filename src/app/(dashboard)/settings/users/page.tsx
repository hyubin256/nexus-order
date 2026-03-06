import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUsers } from "@/actions/user";
import { UserTable } from "@/components/settings/user-table";
import { CreateUserModal } from "@/components/settings/create-user-modal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý nhân viên | Minh Huy",
};

export default async function UsersPage() {
  const session = await auth();

  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Quản lý Admin</h1>
          <p className="text-muted-foreground mt-1">Danh sách tất cả các tài khoản quản trị trong hệ thống.</p>
        </div>
        <CreateUserModal />
      </div>

      <UserTable users={users} currentUser={session!.user!} />
    </div>
  );
}
