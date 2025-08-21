import { cva } from "class-variance-authority";
import clsx from "clsx";

const button = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      intent: {
        primary: "bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:from-brand-accent hover:to-sky-600 focus-visible:ring-brand-accent",
        secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
        ghost: "text-neutral-800 hover:bg-neutral-100",
        danger: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: { intent:"primary", size:"md" },
  }
);

export function Button({ intent, size, className, children, ...props }) {
  return (
    <button className={clsx(button({ intent, size }), className)} {...props}>
      {children}
    </button>
  );
}
