type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Switch({
  checked,
  onChange,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked
          ? "bg-blue-600"
          : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked
            ? "translate-x-6"
            : "translate-x-1"
        }`}
      />
    </button>
  );
}