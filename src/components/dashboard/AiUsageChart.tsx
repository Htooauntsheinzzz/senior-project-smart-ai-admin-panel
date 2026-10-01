import { useEffect, useId, useRef, useState } from 'react'
import { usage } from '../../data/dashboard'
import { Badge, Panel } from './DashboardUi'

export default function AiUsageChart() {
  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const id = useId()
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(Math.max(220, entries[0].contentRect.width)))
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  const points = usage.map((point, index) => ({ x: 32 + index * (width - 52) / 11, y: 240 - point.value / 260 * 210 }))
  const line = points.reduce((path, point, index) => {
    if (!index) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const middle = (previous.x + point.x) / 2
    return `${path} C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`
  }, '')
  return <Panel title="AI Assistant Usage" subtitle="Questions asked today — 24-hour view" action={<Badge className="bg-[#fdeaf2] text-[#dc4c8d]">1,304 today</Badge>}>
    <div ref={container} className="w-full py-2">
      <svg viewBox={`0 0 ${width} 302`} className="block w-full" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>AI questions over 24 hours</title>
        <desc id={`${id}-description`}>Illustrative demo data: low overnight, rising after 06:00, peaking near 10:00 and 14:00, then declining. Values are approximated, not live analytics.</desc>
        <defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#17b5d8" stopOpacity="0.18" /><stop offset="100%" stopColor="#17b5d8" stopOpacity="0.02" /></linearGradient></defs>
        {[0, 65, 130, 195, 260].map(value => {
          const y = 240 - value / 260 * 210
          return <g key={value}><line x1="32" y1={y} x2={width - 20} y2={y} stroke="#e5e8f0" strokeDasharray="4 4" /><text x="24" y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{value}</text></g>
        })}
        <path d={`${line} L ${points[11].x} 240 L 32 240 Z`} fill={`url(#${id}-fill)`} />
        <path d={line} fill="none" stroke="#16b6d7" strokeWidth="2.5" />
        {usage.map((point, index) => <text key={point.time} x={points[index].x} y="263" transform={width < 500 ? `rotate(-55 ${points[index].x} 263)` : undefined} textAnchor={width < 500 ? 'end' : 'middle'} fontSize="10" fill="#9ca3af">{point.time}</text>)}
      </svg>
    </div>
  </Panel>
}
