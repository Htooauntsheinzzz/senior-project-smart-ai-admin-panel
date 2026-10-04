interface ApiErrorShape {
  response?: { status?: number; data?: { message?: string } }
}

// Maps an Axios failure to a safe display message. Backend validation,
// conflict, and not-found messages are shown as provided; everything else
// falls back to a generic message so internals are never exposed.
export function apiErrorMessage(error: unknown, fallback: string): string {
  const { status, data } = (error as ApiErrorShape)?.response ?? {}
  if (status === 403) return 'You do not have permission to perform this action.'
  if ((status === 400 || status === 404 || status === 409) && data?.message) return data.message
  return fallback
}
