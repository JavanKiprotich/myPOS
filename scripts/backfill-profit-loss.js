const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Profit & Loss data backfill...");

  // ----------------------------------------------------
  // 1. Backfill SaleItem.unitCost
  // ----------------------------------------------------

  const saleItems = await prisma.saleItem.findMany({
    where: {
      unitCost: null,
    },
    include: {
      product: {
        select: {
          costPrice: true,
        },
      },
    },
  });

  console.log(
    `Sale items needing cost: ${saleItems.length}`
  );

  let saleItemsUpdated = 0;

  for (const item of saleItems) {
    await prisma.saleItem.update({
      where: {
        id: item.id,
      },
      data: {
        unitCost: item.product.costPrice,
      },
    });

    saleItemsUpdated++;
  }

  // ----------------------------------------------------
  // 2. Backfill RunningBillItem.unitCost
  // ----------------------------------------------------

  const runningBillItems =
    await prisma.runningBillItem.findMany({
      where: {
        unitCost: null,
      },
      include: {
        product: {
          select: {
            costPrice: true,
          },
        },
      },
    });

  console.log(
    `Running bill items needing cost: ${runningBillItems.length}`
  );

  let runningBillItemsUpdated = 0;

  for (const item of runningBillItems) {
    await prisma.runningBillItem.update({
      where: {
        id: item.id,
      },
      data: {
        unitCost: item.product.costPrice,
      },
    });

    runningBillItemsUpdated++;
  }

  // ----------------------------------------------------
  // 3. Backfill Expense.storeId
  // ----------------------------------------------------

  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const expenses = await prisma.expense.findMany({
    where: {
      storeId: null,
    },
  });

  console.log(
    `Expenses needing store: ${expenses.length}`
  );

  let expensesUpdated = 0;

  if (expenses.length > 0) {
    if (stores.length === 0) {
      throw new Error(
        "No stores exist. Cannot assign expenses to a store."
      );
    }

    if (stores.length > 1) {
      console.log("\nMultiple stores were found:");

      for (const store of stores) {
        console.log(
          `- ${store.id} | ${store.name}`
        );
      }

      throw new Error(
        "There are multiple stores and existing expenses have no storeId. Assign them manually before continuing."
      );
    }

    const storeId = stores[0].id;

    await prisma.expense.updateMany({
      where: {
        storeId: null,
      },
      data: {
        storeId,
      },
    });

    expensesUpdated = expenses.length;

    console.log(
      `Assigned ${expensesUpdated} expenses to "${stores[0].name}".`
    );
  }

  console.log("\nBackfill complete.");
  console.log(
    `Sale items updated: ${saleItemsUpdated}`
  );
  console.log(
    `Running bill items updated: ${runningBillItemsUpdated}`
  );
  console.log(
    `Expenses updated: ${expensesUpdated}`
  );
}

main()
  .catch((error) => {
    console.error("\nBackfill failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });