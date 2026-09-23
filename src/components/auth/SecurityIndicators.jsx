const indicators = [
  { label: '256-bit SSL', color: '#273238' },
  { label: 'Admin Only', color: '#22C55E' },
  { label: 'Verified', color: '#D80255' },
]

export default function SecurityIndicators() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {indicators.map((indicator) => (
        <div
          className="flex items-center gap-2 text-xs text-[#9CA3AF]"
          key={indicator.label}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: indicator.color }}
          />
          {indicator.label}
        </div>
      ))}
    </div>
  )
}
