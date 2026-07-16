const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Skip if already hashed
    if (user.password.startsWith("$2")) {
      console.log(`${user.email} already hashed`);
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashed,
      },
    });

    console.log(`Updated ${user.email}`);
  }

  console.log("All passwords hashed successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });