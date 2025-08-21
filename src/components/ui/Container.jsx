export default function Container({ className = '', children }) {
  return <div className={`container-premium ${className}`}>{children}</div>;
}
