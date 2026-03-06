"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Save, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { importBatchStockAction } from "@/actions/inventory";
import { Product } from "@/types/product";

import { getSuppliers } from "@/actions/supplier";
import { SupplierModal } from "@/components/partners/supplier-modal";

interface ImportRow {
  id: string; // Tạm dùng random id cho UI
  productId: string;
  productName: string;
  quantity: number;
  importPrice: number;
}

interface Supplier {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  taxCode?: string | null;
}

export default function ImportInventoryPage() {
  const router = useRouter();

  // Header State
  const [supplierId, setSupplierId] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [importCode] = useState<string>(`IMP-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
  const [loading, setLoading] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSupplierComboOpen, setIsSupplierComboOpen] = useState(false);

  // Body State (Dynamic Table)
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Combobox popover states
  const [openComboboxIndex, setOpenComboboxIndex] = useState<number | null>(null);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, suppRes] = await Promise.all([
          fetch("/api/products?limit=100"),
          getSuppliers()
        ]);

        const prodJson = await prodRes.json();
        if (prodJson.data) setProducts(prodJson.data);

        if (suppRes.success && suppRes.data) {
          setSuppliers(suppRes.data as Supplier[]);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
    fetchData();
  }, []);

  // Handlers for dynamic table
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: crypto.randomUUID(),
        productId: "",
        productName: "",
        quantity: 1,
        importPrice: 0,
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof ImportRow, value: any) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          const newRow = { ...row, [field]: value };
          // Đồng bộ tên sản phẩm nếu productId đổi
          if (field === "productId") {
            const prod = products.find((p) => p.id === value);
            newRow.productName = prod ? prod.name : "";
            // Gợi ý giá nhập (lấy base price hoặc mặc định)
            if (prod && newRow.importPrice === 0) {
              newRow.importPrice = Math.floor(prod.basePrice * 0.7); // Ví dụ giá nhập rẻ hơn giá bán
            }
          }
          return newRow;
        }
        return row;
      })
    );
  };

  // Helper tính toán
  const totalAmount = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.quantity * row.importPrice, 0);
  }, [rows]);

  const isValid = useMemo(() => {
    return rows.length > 0 &&
      rows.every(r => r.productId !== "" && r.quantity > 0 && r.importPrice >= 0);
  }, [rows]);

  // Submit
  const handleConfirm = async () => {
    if (!isValid) {
      toast.error("Vui lòng điền đủ thông tin các mặt hàng (Chọn SP, SL > 0, Giá >= 0).");
      return;
    }

    try {
      setLoading(true);

      const payload = rows.map(r => ({
        productId: r.productId,
        quantity: r.quantity,
        importPrice: r.importPrice,
      }));

      const res = await importBatchStockAction(
        supplierId || null,
        date.toISOString(),
        importCode,
        payload
      );

      if (res.success) {
        toast.success(`Nhập kho thành công ${res.count} mã sản phẩm!`);
        router.push("/inventory"); // Chuyển về trang danh sách phiếu nhập
      } else {
        toast.error(res.error || "Nhập kho thất bại.");
      }

    } catch (e: any) {
      toast.error(e.message || "Lỗi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplierSuccess = (newSupplier: Supplier) => {
    setSuppliers([...suppliers, newSupplier]);
    setSupplierId(newSupplier.id);
    setSelectedSupplier(newSupplier);
    setIsSupplierModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Phiếu nhập kho</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Header: Thông tin nhập */}
        <Card className="col-span-full xl:col-span-3 border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Mã phiếu nhập (Auto)</Label>
                <Input value={importCode} disabled className="bg-muted font-mono" />
              </div>

              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Popover open={isSupplierComboOpen} onOpenChange={setIsSupplierComboOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isSupplierComboOpen}
                          className="w-full justify-between"
                        >
                          <span className="truncate">
                            {selectedSupplier ? selectedSupplier.name : "Chọn nhà cung cấp..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Tìm nhà cung cấp..." />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy nhà cung cấp nào.</CommandEmpty>
                            <CommandGroup>
                              {suppliers.map((p) => (
                                <CommandItem
                                  key={p.id}
                                  value={p.name}
                                  onSelect={() => {
                                    setSupplierId(p.id);
                                    setSelectedSupplier(p);
                                    setIsSupplierComboOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      supplierId === p.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{p.name}</span>
                                    {p.phone && <span className="text-xs text-muted-foreground">{p.phone}</span>}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsSupplierModalOpen(true)}
                    title="Thêm nhà cung cấp mới"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="mb-1">Ngày nhập</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(day) => day && setDate(day)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body: Danh sách mặt hàng */}
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Danh sách mặt hàng</CardTitle>
            <Button onClick={addRow} variant="secondary" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm dòng
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[10px]">#</TableHead>
                    <TableHead className="w-[30%] min-w-[300px]">Sản phẩm</TableHead>
                    <TableHead className="w-[150px] text-right">Số lượng</TableHead>
                    <TableHead className="w-[200px] text-right">Giá nhập (VNĐ)</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                    <TableHead className="w-[60px] text-center">Xóa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Chưa có mặt hàng nào. Vui lòng bấm "Thêm dòng" để bắt đầu nhập.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium align-middle">
                          {index + 1}
                        </TableCell>
                        <TableCell className="align-middle">
                          <Popover
                            open={openComboboxIndex === index}
                            onOpenChange={(isOpen) => setOpenComboboxIndex(isOpen ? index : null)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between font-normal",
                                  !row.productId && "text-muted-foreground"
                                )}
                              >
                                {row.productName
                                  ? row.productName
                                  : "Tìm chọn sản phẩm..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[300px]" align="start">
                              <Command>
                                <CommandInput placeholder="Tìm kiếm theo tên / SKU..." />
                                <CommandList>
                                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                  <CommandGroup>
                                    {products.map((product) => (
                                      <CommandItem
                                        value={`${product.sku} ${product.name}`}
                                        key={product.id}
                                        onSelect={() => {
                                          updateRow(row.id, "productId", product.id);
                                          setOpenComboboxIndex(null);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            product.id === row.productId
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span>{product.name}</span>
                                          <span className="text-xs text-muted-foreground font-mono">
                                            {product.sku}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell className="align-middle">
                          <Input
                            type="number"
                            min="1"
                            className="text-right"
                            value={row.quantity || ""}
                            onChange={(e) => updateRow(row.id, "quantity", parseInt(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="align-middle">
                          <Input
                            type="number"
                            min="0"
                            className="text-right font-mono"
                            value={row.importPrice || ""}
                            onChange={(e) => updateRow(row.id, "importPrice", parseInt(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium align-middle">
                          {formatCurrency(row.quantity * row.importPrice)}
                        </TableCell>
                        <TableCell className="text-center align-middle">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeRow(row.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Fixed */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md p-4 shadow-lg md:left-64 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Tổng tiền phiếu nhập:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <Button
          size="lg"
          onClick={handleConfirm}
          disabled={!isValid || loading}
          className="w-full md:w-auto min-w-[200px]"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Đang xử lý...
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="mr-2 h-5 w-5" />
              Xác nhận nhập kho
            </div>
          )}
        </Button>
      </div>
      <SupplierModal
        open={isSupplierModalOpen}
        onOpenChange={setIsSupplierModalOpen}
        onSuccess={handleAddSupplierSuccess}
      />
    </div>
  );
}
