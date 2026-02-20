import { prisma } from "../lib/prisma";

async function main() {
    const players = await prisma.player.createMany({
        data: [{
            lastName: "Козлов",
            firstName: "Евгений",
            birthDate: new Date("1997-08-05"),
            position: "Forward",
            height: 183,
            weight: 80,
            contractExpiry: new Date("2026-06-01"),
            },
            {
            lastName: "Морозов",
            firstName: "Артём",
            birthDate: new Date("1999-02-14"),
            position: "Defenseman",
            height: 187,
            weight: 88,
            contractExpiry: new Date("2027-06-01"),
            },
        ],
    });

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
