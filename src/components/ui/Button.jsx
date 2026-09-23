export default function Button({ children, isLoading, ...buttonProps }) {
  return (
    <button
      {...buttonProps}
      disabled={buttonProps.disabled || isLoading}
      className="flex h-[55px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#273238] to-[#1A2329] px-5 font-display text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(24,42,90,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(24,42,90,0.36)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#273238]/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  )
}
