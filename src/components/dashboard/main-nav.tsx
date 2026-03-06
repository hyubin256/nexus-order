"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Tổng quan" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/inventory", label: "Kho hàng" },
  { href: "/partners", label: "Đối tác" },
  { href: "/sales/orders", label: "Doanh thu" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => {
        const isActive = item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary relative py-1",
              isActive ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary" : "text-muted-foreground hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:h-0.5 hover:after:w-full hover:after:bg-muted-foreground/30"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
