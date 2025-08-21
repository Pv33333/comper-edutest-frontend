export default function Skeleton({ className = " bg-white" }) {
  return (
    <div className={`animate-pulse rounded bg-white ${className}`} />
  );
}
