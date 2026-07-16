import { prisma } from "@/lib/prisma";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      creditAccount: {
        include: {
          transactions: true,
        },
      },
    },
  });

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        {customer.name}
      </h1>

      <p className="mt-2">
        Phone: {customer.phone}
      </p>

      <p className="mt-4 font-bold">
        Outstanding Balance:
        KES {customer.creditAccount?.balance ?? 0}
      </p>

      <h2 className="text-xl mt-8 mb-4">
        Transactions
      </h2>

      <ul>
        {customer.creditAccount?.transactions.map(
          (t) => (
            <li key={t.id}>
              {t.type} - KES {t.amount}
            </li>
          )
        )}
      </ul>
    </div>
  );
}