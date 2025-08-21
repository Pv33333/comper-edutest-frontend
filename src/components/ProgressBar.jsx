import React from 'react'

export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value))
  const color = pct < 40 ? 'bg-red-500' : pct < 80 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="w-full bg-white border border-blue-300 rounded-full h-4 overflow-hidden">
      <div
        className={`h-4 rounded-full transition-all duration-700 ease-in-out ${color}`}
        style={{ width: pct + '%' }}
      />
    </div>
  )
}
