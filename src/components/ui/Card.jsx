import React from "react";
export default function Card({ className = "", children, ...props }) {
  return <div className={["surface rounded-2xl p-5", className].join(" ")} {...props}>{children}</div>;
}
