import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Tạo Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@nexusorder.com" },
    update: {},
    create: {
      email: "superadmin@nexusorder.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  // Tạo Admin thường
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexusorder.com" },
    update: {},
    create: {
      email: "admin@nexusorder.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed data created:");
  console.log("- Super Admin:", superAdmin.email);
  console.log("- Admin:", admin.email);
  console.log("Password cho cả hai là: password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
