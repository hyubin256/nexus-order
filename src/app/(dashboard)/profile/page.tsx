import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/profile/profile-form";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | Minh Huy",
  description: "Quản lý thông tin cá nhân và mật khẩu của bạn.",
};

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <Badge variant="outline" className="px-3 py-1 text-sm font-semibold border-primary text-primary uppercase">
          {(user as any).role}
        </Badge>
      </div>

      <Card className="border-none shadow-premium">
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>
            Cập nhật tên hiển thị và mật khẩu của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <AvatarUpload currentImage={user.image} name={user.name} />
          <Separator />
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
