"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FilterX } from "lucide-react";
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

interface InventoryFilterProps {
  suppliers: any[];
}

export function InventoryFilter({ suppliers }: InventoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const supplierId = searchParams.get("supplierId") || "all";

  const date: DateRange | undefined = from
    ? { from: new Date(from), to: to ? new Date(to) : undefined }
    : undefined;

  const createQueryString = React.useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "all") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      // Reset về trang 1 khi lọc
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

  const handleSupplierChange = (value: string) => {
    router.push(`${pathname}?${createQueryString({ supplierId: value })}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 mb-6">
      <div className="grid gap-2 w-full sm:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                    {format(date.to, "dd/MM/yyyy", { locale: vi })}
                  </>
                ) : (
                  format(date.from, "dd/MM/yyyy", { locale: vi })
                )
              ) : (
                <span>Lọc theo ngày</span>
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
      </div>

      <div className="w-full sm:w-[200px]">
        <Select value={supplierId} onValueChange={handleSupplierChange}>
          <SelectTrigger>
            <SelectValue placeholder="Nhà cung cấp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(date || supplierId !== "all") && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="h-10 px-3 hover:bg-red-50 hover:text-red-600 text-muted-foreground"
        >
          <FilterX className="mr-2 h-4 w-4" />
          Xóa lọc
        </Button>
      )}
    </div>
  );
}
