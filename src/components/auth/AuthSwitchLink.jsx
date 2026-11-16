import { Link } from 'react-router-dom'

export default function AuthSwitchLink({ prompt, linkLabel, to }) {
  return (
    <p className="mt-5 text-center text-[13.5px] text-[#68728A]">
      {prompt}{' '}
      <Link
        className="font-semibold text-[#273238] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
        to={to}
      >
        {linkLabel}
      </Link>
    </p>
  )
}
