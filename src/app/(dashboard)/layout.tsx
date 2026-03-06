import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { MainNav } from "@/components/dashboard/main-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserNav } from "@/components/dashboard/user-nav";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">Minh Huy</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <MainNav />

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            <Button asChild className="hidden sm:flex gap-2">
              <Link href="/sales/pos">
                <Plus className="h-4 w-4" />
                Tạo đơn hàng
              </Link>
            </Button>
            <UserNav user={session.user!} />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
