import React from 'react'
import ChartCanvas from './ChartCanvas'

export default function StatsModal({ open, onClose, title, labels = [], data = [], colors = [] }) {
  if (!open) return null
  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: title, data, backgroundColor: colors.length ? colors : '#2563EB', borderRadius: 6 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 rounded-xl px-3 py-1.5 text-white bg-blue-500 hover:bg-blue-700 shadow-sm">×</button>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
        <ChartCanvas config={config} height={260} />
      </div>
    </div>
  )
}
