const statusStyles: Record<string, string> = {
  NOT_STARTED: "border-slate-200 bg-slate-100 text-slate-700",
  IN_PROGRESS: "border-amber-200 bg-amber-50 text-amber-700",
  READY_FOR_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  COMPLETE: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  READY_FOR_REVIEW: "Ready for review",
  COMPLETE: "Complete",
};

export function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
