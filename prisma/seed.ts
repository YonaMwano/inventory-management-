import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: "MAIN" },
    update: {},
    create: {
      name: "Main Warehouse",
      code: "MAIN",
      address: "Primary storage location",
    },
  });

  // Company settings
  const settingsCount = await prisma.companySettings.count();
  if (settingsCount === 0) {
    await prisma.companySettings.create({
      data: {
        companyName: "My Inventory Co.",
        currency: "USD",
        taxRate: 0,
      },
    });
  }

  // Categories
  const electronics = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics", description: "Electronic devices and accessories" },
  });
  const office = await prisma.category.upsert({
    where: { name: "Office Supplies" },
    update: {},
    create: { name: "Office Supplies" },
  });

  console.log("Seed complete. Register a user via /register to get started.");
  console.log("Warehouse:", warehouse.code);
  console.log("Categories:", electronics.name, office.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
