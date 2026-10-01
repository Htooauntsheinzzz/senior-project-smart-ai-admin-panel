import type { Accent } from '../../data/dashboard'

export const accentClasses: Record<Accent, { tile: string; button: string }> = {
  neutral: { tile: 'bg-[#eef0f2] text-[#273238]', button: 'bg-[#273238] shadow-[#273238]/15' },
  purple: { tile: 'bg-[#f2edff] text-[#8250df]', button: 'bg-[#8250df] shadow-[#8250df]/20' },
  orange: { tile: 'bg-[#fff1e5] text-[#ed8a32]', button: 'bg-[#ed8a32] shadow-[#ed8a32]/20' },
  green: { tile: 'bg-[#e7f7ef] text-[#22a676]', button: 'bg-[#22a676] shadow-[#22a676]/20' },
  pink: { tile: 'bg-[#fdeaf2] text-[#dc4c8d]', button: 'bg-[#dc4c8d] shadow-[#dc4c8d]/20' },
  cyan: { tile: 'bg-[#e5f7fc] text-[#17a5d2]', button: 'bg-[#17a5d2] shadow-[#17a5d2]/20' },
}
