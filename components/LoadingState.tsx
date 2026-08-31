export default function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-ledger" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
