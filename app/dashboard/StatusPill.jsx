const STYLES = {
  draft: "bg-slate-200 text-slate-600",
  pending: "bg-[#FFB703]/20 text-[#8a5c00]",
  published: "bg-emerald-100 text-emerald-700",
};

const LABELS = {
  draft: "Draft",
  pending: "Pending review",
  published: "Published",
};

export default function StatusPill({ status }) {
  const key = STYLES[status] ? status : "draft";
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STYLES[key]}`}
    >
      {LABELS[key]}
    </span>
  );
}
