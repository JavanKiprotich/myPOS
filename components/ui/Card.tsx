type CardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function Card({
  title,
  description,
  children,
}: CardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}