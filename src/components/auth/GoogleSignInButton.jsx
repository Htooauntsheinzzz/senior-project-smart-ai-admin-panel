import { useEffect, useRef, useState } from 'react'
import {
  googleButtonWidth,
  releaseGoogleButton,
  renderGoogleButton,
} from '../../utils/googleIdentity'

// How long Google gets to show its button before the page says that it did
// not, and how long the page keeps looking after that.
const SHOW_WAIT_MS = 6000
const WATCH_LIMIT_MS = 30000
const WATCH_STEP_MS = 250

// Google's own "Sign in with Google" button (spec 45, section 7). Google draws
// it in an iframe; this component gives it a place and a width, and shows what
// is going on: loading, ready, not shown by Google, script not loaded.
export default function GoogleSignInButton({
  text = 'signin_with',
  isBusy = false,
  onCredential,
  onError,
}) {
  const wrapperRef = useRef(null)
  const containerRef = useRef(null)
  const handlersRef = useRef({ onCredential, onError })
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    handlersRef.current = { onCredential, onError }
  })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const container = containerRef.current
    let isActive = true
    let drawnWidth = 0
    let watchTimer = 0

    function handleResponse(response) {
      const idToken = typeof response?.credential === 'string' ? response.credential : ''

      if (idToken) {
        handlersRef.current.onCredential?.(idToken)
      } else {
        handlersRef.current.onError?.()
      }
    }

    // Google answers 403 for a client ID or a site address it does not accept
    // and for a blocked request; its iframe then stays empty (0 x 0). So the
    // button counts as shown only when something with a height is there.
    function watch() {
      const startedAt = Date.now()

      function look() {
        const drawn = container.querySelector('iframe, button, [role="button"]')

        if (drawn && drawn.offsetHeight > 0) {
          window.clearInterval(watchTimer)
          setStatus('ready')
          return true
        }

        const waited = Date.now() - startedAt

        if (waited > SHOW_WAIT_MS) {
          setStatus('unavailable')
        }

        if (waited > WATCH_LIMIT_MS) {
          window.clearInterval(watchTimer)
        }

        return false
      }

      window.clearInterval(watchTimer)

      if (!look()) {
        watchTimer = window.setInterval(look, WATCH_STEP_MS)
      }
    }

    function draw() {
      // Nothing to measure while the card is not shown or already left the page.
      if (!wrapper.isConnected || wrapper.clientWidth === 0) {
        return
      }

      const width = googleButtonWidth(wrapper.clientWidth)

      if (width === drawnWidth) {
        return
      }

      drawnWidth = width
      renderGoogleButton(container, { text, width, onResponse: handleResponse }, () => isActive)
        .then((isDrawn) => {
          if (isDrawn && isActive) {
            watch()
          }
        })
        .catch(() => {
          drawnWidth = 0

          if (isActive) {
            setStatus('failed')
          }
        })
    }

    draw()

    // Google's button has a fixed width in pixels, so it is drawn again when
    // the card gets wider or narrower.
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(draw) : null
    observer?.observe(wrapper)

    return () => {
      isActive = false
      window.clearInterval(watchTimer)
      observer?.disconnect()
      releaseGoogleButton(handleResponse)
    }
  }, [text, attempt])

  function retry() {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }

  const isButtonVisible = status === 'ready' && !isBusy

  return (
    <div className="w-full" ref={wrapperRef}>
      {isBusy && (
        <div
          className="flex h-10 w-full items-center justify-center gap-2.5 rounded-full border border-[#E5E8F0] bg-white text-[13.5px] font-semibold text-[#273238]"
          role="status"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5E8F0] border-t-[#273238]" />
          Signing in with Google...
        </div>
      )}

      {!isBusy && status === 'loading' && (
        <div
          className="flex h-10 w-full items-center justify-center rounded-full border border-[#E5E8F0] bg-[#F7F8FC] text-[12.5px] font-medium text-[#9CA3AF]"
          role="status"
        >
          Loading Google sign-in...
        </div>
      )}

      {!isBusy && status === 'unavailable' && (
        <div
          className="flex min-h-10 w-full items-center justify-center rounded-2xl border border-[#E5E8F0] bg-[#F7F8FC] px-3 py-2 text-center text-[12.5px] leading-5 text-[#68728A]"
          role="status"
        >
          Google sign-in is not available on this site address yet.
        </div>
      )}

      {!isBusy && status === 'failed' && (
        <div
          className="flex min-h-10 w-full flex-wrap items-center justify-center gap-x-1.5 rounded-2xl border border-[#E5E8F0] bg-[#F7F8FC] px-3 py-2 text-center text-[12.5px] leading-5 text-[#68728A]"
          role="alert"
        >
          Google sign-in could not be loaded.
          <button
            className="font-semibold text-[#273238] underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#273238]/20"
            onClick={retry}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {/* Google fills this element. Until its button is there (and while a
          sign-in is checked) it takes no room, but it stays in the page so
          Google can finish drawing. */}
      <div
        className={isButtonVisible ? 'flex h-10 justify-center' : 'h-0 overflow-hidden'}
        data-google-button=""
        inert={!isButtonVisible}
        ref={containerRef}
      />
    </div>
  )
}
