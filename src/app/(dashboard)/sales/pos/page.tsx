"use client";

import * as React from "react";
import {
  Search,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Printer,
  CheckCircle2,
  PackageSearch,
  X,
  Building2,
  MapPin,
  Hash,
  ChevronDown,
  ChevronUp,
  Banknote
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import { getProducts } from "@/actions/product";
import { getCustomerByPhone } from "@/actions/customer";
import { createPOSOrder } from "@/actions/pos";
import { uploadPaymentBill } from "@/actions/upload";
import { Upload, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  basePrice: number;
  currentStock: number;
}

interface CartItem extends Product {
  quantity: number;
  discountValue: number;
  discountType: "fixed" | "percent";
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  taxCode?: string | null;
  type?: "INDIVIDUAL" | "COMPANY";
}

export default function POSPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [customerName, setCustomerName] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [taxCode, setTaxCode] = React.useState("");
  const [customerType, setCustomerType] = React.useState<"INDIVIDUAL" | "COMPANY">("INDIVIDUAL");
  const [isCustomerExpanded, setIsCustomerExpanded] = React.useState(false);
  const [discountValue, setDiscountValue] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState<{ id: string; code: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "TRANSFER">("CASH");
  const [transactionId, setTransactionId] = React.useState("");
  const [paymentImage, setPaymentImage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  // Fetch products on mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      const result = await getProducts();
      if (result.success) {
        setProducts(result.data as Product[]);
        setFilteredProducts(result.data as Product[]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Filter products by search query
  React.useEffect(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Search customer by phone
  const handleCustomerSearch = async () => {
    if (customerPhone.length >= 10) {
      const result = await getCustomerByPhone(customerPhone);
      if (result.success && result.data) {
        const c = result.data as Customer;
        setCustomer(c);
        setCustomerName(c.name);
        setCustomerAddress(c.address || "");
        setTaxCode(c.taxCode || "");
        setCustomerType(c.type || "INDIVIDUAL");
        toast.success(`Chào mừng ${result.data.name} quay trở lại!`);
      } else {
        setCustomer(null);
      }
    } else {
      setCustomer(null);
    }
  };

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          toast.error("Vượt quá số lượng tồn kho!");
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, discountValue: 0, discountType: "fixed" }];
    });
  };

  const updateItemDiscount = (id: string, value: number, type: "fixed" | "percent") => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, discountValue: value, discountType: type } : item
    ));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.currentStock) {
          toast.error("Vượt quá số lượng tồn kho!");
          return item;
        }
        if (newQty <= 0) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("bill", file);

      const res = await uploadPaymentBill(formData);
      if (res.success && res.url) {
        setPaymentImage(res.url);
        toast.success("Đã tải lên hình ảnh bill!");
      } else {
        toast.error(res.error || "Không thể tải lên hình ảnh");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate total amount (gross)
  const totalAmount = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

  // Calculate item-level discounts
  const itemsDiscountTotal = cart.reduce((sum, item) => {
    const itemSubtotal = item.basePrice * item.quantity;
    const discountAmount = item.discountType === "percent"
      ? (itemSubtotal * item.discountValue / 100)
      : item.discountValue;
    return sum + discountAmount;
  }, 0);

  // Calculate final amount after all discounts
  const finalAmount = Math.max(0, totalAmount - itemsDiscountTotal - discountValue);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    setProcessing(true);
    const result = await createPOSOrder({
      customerId: customer?.id,
      customerName: customerName || (customerType === "COMPANY" ? "Công ty / Hộ KD" : "Khách lẻ"),
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      taxCode: taxCode,
      customerType: customerType,
      items: cart.map(item => {
        const itemSubtotal = item.basePrice * item.quantity;
        const discountAtSale = item.discountType === "percent"
          ? (itemSubtotal * item.discountValue / 100)
          : item.discountValue;

        return {
          productId: item.id,
          quantity: item.quantity,
          price: item.basePrice,
          discountAtSale,
        };
      }),
      totalAmount,
      discountValue: itemsDiscountTotal + discountValue,
      finalAmount,
      paymentMethod,
      transactionId,
      paymentImage: paymentImage || undefined,
      paymentStatus: paymentMethod === "TRANSFER" ? "PENDING" : "PAID",
    });

    if (result.success && result.data) {
      setOrderSuccess({ id: result.data.id, code: result.data.code });
      setCart([]);
      setCustomer(null);
      setCustomerPhone("");
      setCustomerName("");
      setCustomerAddress("");
      setTaxCode("");
      setCustomerType("INDIVIDUAL");
      setDiscountValue(0);
      setTransactionId("");
      setPaymentImage(null);
      toast.success("Đơn hàng đã được lưu và trừ tồn kho thành công!");
    } else {
      toast.error(result.error || "Thanh toán thất bại");
    }
    setProcessing(false);
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-95 duration-300">
        <div className="p-4 bg-green-100 rounded-full">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Thanh toán hoàn tất!</h2>
          <p className="text-muted-foreground">Mã đơn hàng: <span className="font-mono font-bold text-foreground">{orderSuccess.code}</span></p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            In hóa đơn
          </Button>
          <Button className="flex-1" onClick={() => setOrderSuccess(null)}>
            Tiếp tục bán hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Left Column: Product Selection */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center gap-4 bg-background p-2 rounded-lg border shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm sản phẩm bằng tên hoặc SKU..."
              className="pl-9 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1 h-9">
            {filteredProducts.length} Sản phẩm
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse border" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`group overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md ${product.currentStock <= 0 ? 'opacity-60 grayscale' : ''}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <PackageSearch className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    {product.currentStock <= 5 && product.currentStock > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="text-[10px]">İt hàng: {product.currentStock}</Badge>
                      </div>
                    )}
                    {product.currentStock <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge variant="outline" className="bg-white/90 text-black font-bold">HẾT HÀNG</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-semibold truncate leading-tight mb-1">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold">{formatCurrency(product.basePrice)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <PackageSearch className="h-16 w-16 text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-xl font-semibold text-muted-foreground">Không tìm thấy sản phẩm</p>
                <p className="text-sm text-muted-foreground">Thử lại với từ khóa khác hoặc dọn sạch ô tìm kiếm</p>
              </div>
              <Button variant="outline" onClick={() => setSearchQuery("")}>Xóa tìm kiếm</Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart & Checkout */}
      <div className="w-full lg:w-[400px] flex flex-col h-full animate-in slide-in-from-right duration-500">
        <Card className="flex-1 flex flex-col shadow-lg border-none overflow-hidden gap-0 rounded-2xl">
          <CardHeader className="py-4 border-b bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Đơn hàng hiện tại
              </CardTitle>
              <Badge variant="outline" className="bg-background">{cart.length} món</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              {cart.length > 0 ? (
                <div className="py-4 space-y-4">
                  {cart.map((item) => {
                    const itemSubtotal = item.basePrice * item.quantity;
                    const itemDiscount = item.discountType === "percent"
                      ? (itemSubtotal * item.discountValue / 100)
                      : item.discountValue;
                    const itemFinalAmount = itemSubtotal - itemDiscount;

                    return (
                      <div key={item.id} className="flex flex-col gap-2 p-3 bg-muted/40 rounded-xl animate-in slide-in-from-right-2 duration-300">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 rounded-lg border shrink-0">
                            <AvatarImage src={item.image || ""} className="object-cover" />
                            <AvatarFallback className="rounded-lg">{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-semibold truncate leading-none pt-0.5">{item.name}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive transition-opacity"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-primary">{formatCurrency(item.basePrice)}</p>
                              <div className="flex items-center gap-2 bg-background rounded-full px-1 border border-border">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground min-w-fit">Giảm giá</span>
                            <div className="flex h-7 items-center rounded-md border border-input bg-background overflow-hidden">
                              <Input
                                type="number"
                                className="h-full w-16 border-0 focus-visible:ring-0 text-xs px-2 text-right font-medium"
                                value={item.discountValue || ""}
                                onChange={(e) => updateItemDiscount(item.id, Number(e.target.value), item.discountType)}
                                placeholder="0"
                              />
                              <div className="h-full w-px bg-input" />
                              <button
                                onClick={() => updateItemDiscount(item.id, item.discountValue, item.discountType === "fixed" ? "percent" : "fixed")}
                                className={`text-[10px] font-bold h-full w-10 px-1 transition-colors hover:bg-muted ${item.discountType === "percent" ? "bg-primary text-primary-foreground" : ""}`}
                              >
                                {item.discountType === "percent" ? "%" : "VNĐ"}
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tổng cộng</span>
                            <span className="text-sm font-black text-primary">{formatCurrency(itemFinalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
                  <ShoppingCart className="h-16 w-16" />
                  <p className="text-sm font-medium">Giỏ hàng đang trống</p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-3 border-t bg-muted/30 flex flex-col gap-2">
            {/* Customer Section */}
            <div className="w-full space-y-2">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-1 -m-1 rounded-md transition-colors"
                onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Khách hàng: <span className="text-primary font-bold lowercase">{customerName || (customerType === "COMPANY" ? "Công ty / Hộ KD" : "Khách lẻ")}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isCustomerExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              {isCustomerExpanded && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                  <Select
                    value={customerType}
                    onValueChange={(val: "INDIVIDUAL" | "COMPANY") => setCustomerType(val)}
                  >
                    <SelectTrigger className="h-7 w-full text-[10px] font-bold uppercase">
                      <SelectValue placeholder="Loại khách" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL" className="text-xs uppercase font-semibold">Khách lẻ</SelectItem>
                      <SelectItem value="COMPANY" className="text-xs uppercase font-semibold">Công ty / Hộ KD</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="space-y-2 p-3 bg-background rounded-xl border border-dashed">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Số điện thoại..."
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          onBlur={handleCustomerSearch}
                          className="h-8 text-sm focus-visible:ring-primary pl-8"
                        />
                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        {customer && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 animate-in fade-in">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          </div>
                        )}
                      </div>
                      {!customer && customerPhone.length >= 10 && (
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={handleCustomerSearch}>Tìm</Button>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        placeholder={customerType === "COMPANY" ? "Tên công ty..." : "Tên khách hàng..."}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-8 text-sm pl-8"
                      />
                      {customerType === "COMPANY" ? (
                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        placeholder="Địa chỉ..."
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="h-8 text-sm pl-8"
                      />
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>

                    {customerType === "COMPANY" && (
                      <div className="relative animate-in slide-in-from-top-2 duration-300">
                        <Input
                          placeholder="Mã số thuế..."
                          value={taxCode}
                          onChange={(e) => setTaxCode(e.target.value)}
                          className="h-8 text-sm pl-8 border-primary/30"
                        />
                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-3.5 text-primary/50" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="w-full space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phương thức thanh toán</span>
              <div className="flex gap-2">
                <Button
                  variant={paymentMethod === "CASH" ? "default" : "outline"}
                  className="flex-1 h-8 gap-2 font-bold rounded-xl text-xs"
                  onClick={() => setPaymentMethod("CASH")}
                >
                  <Banknote className="h-4 w-4" />
                  Tiền mặt
                </Button>
                <Button
                  variant={paymentMethod === "TRANSFER" ? "default" : "outline"}
                  className="flex-1 h-8 gap-2 font-bold rounded-xl text-xs"
                  onClick={() => setPaymentMethod("TRANSFER")}
                >
                  <CreditCard className="h-4 w-4" />
                  Chuyển khoản
                </Button>
              </div>

              {paymentMethod === "TRANSFER" && (
                <div className="space-y-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-indigo-600 block pl-1">Mã giao dịch (Transaction ID)</label>
                    <Input
                      placeholder="Nhập mã giao dịch..."
                      className="h-9 text-sm focus-visible:ring-indigo-500 rounded-xl bg-white"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-indigo-600 block pl-1">Hình ảnh minh họa (Bill)</label>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="bill-upload"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="bill-upload"
                        className={cn(
                          "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all min-h-[80px]",
                          paymentImage ? "border-emerald-300 bg-emerald-50" : "border-indigo-200 bg-white hover:bg-indigo-50/50"
                        )}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-[10px] font-bold text-indigo-500">Đang tải lên bill...</span>
                          </div>
                        ) : paymentImage ? (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-emerald-200">
                              <img src={paymentImage} className="h-full w-full object-cover" alt="Bill bill" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-700 uppercase">Đã tải lên Bill</span>
                              </div>
                              <span className="text-[9px] text-emerald-600">Nhấn để thay đổi ảnh</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <Upload className="h-5 w-5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-500 uppercase">Tải lên hoặc kéo thả bill</span>
                            <span className="text-[9px] text-indigo-400">Hỗ trợ PNG, JPG, JPEG (Tối đa 5MB)</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-1" />

            {/* Calculations and Discount */}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground min-w-fit">Giảm giá</span>
                {itemsDiscountTotal > 0 ? (
                  <span className="text-sm font-bold text-green-600">
                    -{formatCurrency(itemsDiscountTotal)}
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={discountValue || ""}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="h-8 w-24 text-right bg-background text-green-600 font-bold border-none focus-visible:ring-0 px-0"
                      placeholder="0"
                    />
                    <span className="text-sm font-bold text-green-600">đ</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-1">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all mt-2"
              disabled={cart.length === 0 || processing}
              onClick={handleCheckout}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Xác nhận thanh toán
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
