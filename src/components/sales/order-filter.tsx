"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FilterX, Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { vi } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function OrderFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search Param values
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status") || "ALL";
  const paymentMethod = searchParams.get("paymentMethod") || "ALL";
  const minAmount = searchParams.get("minAmount") || "";
  const maxAmount = searchParams.get("maxAmount") || "";
  const search = searchParams.get("search") || "";
  const limit = searchParams.get("limit") || "10";

  const date: DateRange | undefined = from
    ? { from: new Date(from), to: to ? new Date(to) : undefined }
    : undefined;

  const createQueryString = React.useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "ALL" || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      // Reset to page 1 when filtering
      if (!params.hasOwnProperty("page")) {
        newSearchParams.set("page", "1");
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const params: Record<string, string | null> = {
        from: range.from.toISOString(),
        to: range.to ? range.to.toISOString() : null,
      };
      router.push(`${pathname}?${createQueryString(params)}`);
    } else {
      router.push(`${pathname}?${createQueryString({ from: null, to: null })}`);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString({ [key]: value })}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn hoặc khách hàng..."
            defaultValue={search}
            className="pl-10 h-10 rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleFilterChange("search", e.currentTarget.value);
              }
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "h-10 justify-start text-left font-normal rounded-xl border-slate-200",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>{format(date.from, "dd/MM", { locale: vi })} - {format(date.to, "dd/MM", { locale: vi })}</>
                  ) : (
                    format(date.from, "dd/MM/yyyy", { locale: vi })
                  )
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          <Select value={status} onValueChange={(v) => handleFilterChange("status", v)}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PAID">Đã thanh toán</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentMethod} onValueChange={(v) => handleFilterChange("paymentMethod", v)}>
            <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
              <SelectValue placeholder="Thanh toán" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">Tất cả PT</SelectItem>
              <SelectItem value="CASH">Tiền mặt</SelectItem>
              <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
            </SelectContent>
          </Select>

          <Select value={limit} onValueChange={(v) => handleFilterChange("limit", v)}>
            <SelectTrigger className="w-[110px] h-10 rounded-xl border-slate-200">
              <SelectValue placeholder="Số dòng" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="10">10 dòng</SelectItem>
              <SelectItem value="20">20 dòng</SelectItem>
              <SelectItem value="50">50 dòng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Khoảng tiền:</span>
          <Input
            type="number"
            placeholder="Từ"
            defaultValue={minAmount}
            className="w-24 h-9 rounded-lg"
            onBlur={(e) => handleFilterChange("minAmount", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterChange("minAmount", e.currentTarget.value)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Đến"
            defaultValue={maxAmount}
            className="w-24 h-9 rounded-lg"
            onBlur={(e) => handleFilterChange("maxAmount", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterChange("maxAmount", e.currentTarget.value)}
          />
        </div>

        {(search || from || status !== "ALL" || paymentMethod !== "ALL" || minAmount || maxAmount) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-9 px-3 hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors rounded-lg"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Xóa lọc
          </Button>
        )}
      </div>
    </div>
  );
}
