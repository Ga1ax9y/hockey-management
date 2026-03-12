import { prisma } from "../lib/prisma";

async function main() {
  const roles = [
    { name: "Админ", code: "ADMIN", description: "Администратор организации" },
    { name: "Менеджер", code: "MANAGER", description: "Менеджер команды" },
    { name: "Тренер", code: "COACH", description: "Тренер команды" },
    { name: "Врач", code: "DOCTOR", description: "Медицинский персонал" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role
    });
  }

  console.log("Roles seeded");
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
