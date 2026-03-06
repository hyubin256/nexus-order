"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export function DashboardFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "today";

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={currentFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Chọn thời gian" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hôm nay</SelectItem>
          <SelectItem value="week">7 ngày qua</SelectItem>
          <SelectItem value="month">Tháng này</SelectItem>
          <SelectItem value="lastMonth">Tháng trước</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
