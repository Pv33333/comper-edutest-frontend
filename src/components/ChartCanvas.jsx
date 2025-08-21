import React from 'react'
import { useChartJs } from '../hooks/useChartJs'

/**
 * Generic Chart.js canvas wrapper. Pass a Chart.js config object.
 */
export default function ChartCanvas({ config, height = 240, className = '' }) {
  const ref = React.useRef(null)
  const Chart = useChartJs()

  React.useEffect(() => {
    if (!Chart || !ref.current || !config) return
    const ctx = ref.current.getContext('2d')
    const instance = new Chart(ctx, config)
    return () => instance?.destroy()
  }, [Chart, config])

  return <canvas ref={ref} height={height} className={className} />
}
