export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full h-11 rounded-xl border border-default bg-white/90 px-3 text-[rgb(var(--text))] focus:border-[rgba(var(--ring),.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(85,130,246,.25)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
