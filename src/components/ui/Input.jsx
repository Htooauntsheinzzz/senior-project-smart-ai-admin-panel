export default function Input({
  error,
  icon,
  label,
  trailingAction,
  ...inputProps
}) {
  const inputId = inputProps.id || inputProps.name
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div>
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#9CA3AF]"
        >
          {icon}
        </span>
        <input
          {...inputProps}
          id={inputId}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={`h-14 w-full rounded-2xl border bg-white pl-12 text-sm font-medium text-[#273238] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#273238] focus:ring-4 focus:ring-[#273238]/8 ${
            trailingAction ? 'pr-12' : 'pr-4'
          } ${error ? 'border-[#D80255]' : 'border-[#E5E8F0]'}`}
        />
        {trailingAction}
      </div>
      {error && (
        <p className="mt-1.5 px-1 text-xs text-[#B42318]" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
