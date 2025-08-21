import { useState } from "react";
import { ChevronRight } from "lucide-react";

function TreeNode({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-2">
      <div
        className="flex items-center cursor-pointer hover:bg-[rgb(var(--surface-2))] rounded-lg p-1"
        onClick={() => setOpen(!open)}
      >
        <ChevronRight className={`w-4 h-4 mr-1 transition-transform ${open ? "rotate-90" : ""}`} />
        <span>{label}</span>
      </div>
      {open && <div className="ml-5">{children}</div>}
    </div>
  );
}

export default function TreeDropdown({ data }) {
  return (
    <div className="p-2 border border-default rounded-xl bg-white shadow-sm max-h-96 overflow-auto">
      {data.map((node, i) => (
        <TreeNode key={i} label={node.label}>
          {node.children?.map((child, j) => (
            <TreeNode key={j} label={child.label}>
              {child.children?.map((leaf, k) => (
                <div
                  key={k}
                  className="pl-7 py-1 cursor-pointer hover:text-[rgb(var(--primary))]"
                >
                  {leaf.label}
                </div>
              ))}
            </TreeNode>
          ))}
        </TreeNode>
      ))}
    </div>
  );
}
