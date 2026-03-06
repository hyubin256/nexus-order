import { auth } from "@/auth";
import { getCustomers } from "@/actions/customer";
import { getSuppliers } from "@/actions/supplier";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerTable } from "@/components/partners/customer-table";
import { SupplierTable } from "@/components/partners/supplier-table";
import { Users, Truck } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Đối tác | Minh Huy",
};

export default async function PartnersPage() {
  const [customersRes, suppliersRes] = await Promise.all([
    getCustomers(),
    getSuppliers(),
  ]);

  const customers = customersRes.success ? customersRes.data : [];
  const suppliers = suppliersRes.success ? suppliersRes.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Quản lý Đối tác</h1>
        <p className="text-muted-foreground text-sm">Quản lý cơ sở dữ liệu Khách hàng và Nhà cung cấp của bạn.</p>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6 p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="customers" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" />
            Khách hàng
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Truck className="h-4 w-4" />
            Nhà cung cấp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4 focus-visible:outline-none">
          <CustomerTable initialData={customers || []} />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4 focus-visible:outline-none">
          <SupplierTable initialData={suppliers || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
