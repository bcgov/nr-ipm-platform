import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.applications.upsert({
    where: { email: "Brendon.O'Laney@gov.bc.ca" },
    update: {},
    create: {
      email: "Brendon.O'Laney@gov.bc.ca",
      username: "bolaney",
    },
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
