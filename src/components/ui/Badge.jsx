export default function Badge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[rgb(var(--surface-2))] text-[rgb(var(--muted))] ${className}`}
    >
      {children}
    </span>
  );
}
