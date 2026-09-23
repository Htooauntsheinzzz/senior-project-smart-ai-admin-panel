import { Info } from 'lucide-react'

export default function StaffOnlyNotice() {
  return (
    <div className="flex items-start justify-center gap-2.5 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-[12.5px] leading-5 text-[#92400E]">
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">Staff only.</span> Students, use the{' '}
        <span className="font-medium">SMART AI mobile app.</span>
      </p>
    </div>
  )
}
