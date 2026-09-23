export default function LoginBranding() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[72px] w-[185px] items-center justify-center rounded-2xl border border-[#E5E8F0] bg-white px-4 py-3 shadow-[0_4px_8px_rgba(39,50,56,0.08)]">
        <img
          alt="Rangsit University"
          className="max-h-12 max-w-full w-auto"
          src="/assets/rsulogo.png"
        />
      </div>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#273238] px-4 py-1.5 font-display text-[11px] font-bold tracking-[2.2px] text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
        RANGSIT UNIVERSITY
      </div>
    </div>
  )
}
