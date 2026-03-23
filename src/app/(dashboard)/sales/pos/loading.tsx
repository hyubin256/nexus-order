import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex w-full min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Đang tải...</p>
      </div>
    </div>
  );
}
