import { useCallback, useEffect, useState } from 'react'
import { setUnauthorizedHandler } from '../api/apiClient'
import * as authService from '../services/authService'
import {
  getStoredTokenSession,
  removeTokenSession,
  setTokenSession,
} from '../utils/tokenStorage'
import { AuthContext } from './authContext'

function normalizeSession(tokenResponse, remember) {
  return {
    user: tokenResponse?.user || null,
    accessToken: tokenResponse?.accessToken || null,
    refreshToken: tokenResponse?.refreshToken || null,
    forcePasswordChange: Boolean(tokenResponse?.forcePasswordChange),
    remember,
  }
}

// Keeps the tokens of a password login or a Google sign-in (same answer body).
function storeSession(tokenResponse, rememberMe) {
  const nextSession = normalizeSession(tokenResponse, rememberMe)

  if (!nextSession.accessToken || !nextSession.refreshToken) {
    throw new Error('Invalid authentication response.')
  }

  setTokenSession(nextSession, rememberMe)
  return nextSession
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const clearAuthentication = useCallback(() => {
    removeTokenSession()
    setSession(null)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function initializeAuthentication() {
      const storedSession = getStoredTokenSession()

      if (!storedSession) {
        if (isMounted) {
          setIsAuthLoading(false)
        }
        return
      }

      setTokenSession(storedSession, storedSession.remember)

      try {
        const tokenResponse = await authService.refresh(storedSession.refreshToken)

        if (isMounted) {
          const nextSession = normalizeSession(tokenResponse, storedSession.remember)
          setTokenSession(nextSession, storedSession.remember)
          setSession(nextSession)
        }
      } catch {
        removeTokenSession()

        if (isMounted) {
          setSession(null)
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    initializeAuthentication()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(clearAuthentication)

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [clearAuthentication])

  const login = useCallback(async ({ email, password, rememberMe = false }) => {
    const tokenResponse = await authService.login({ email, password })
    const nextSession = storeSession(tokenResponse, rememberMe)

    setSession(nextSession)
    return nextSession
  }, [])

  // The ID token of the Google button (spec 45). The first sign-in of a
  // university account creates the admin account.
  const loginWithGoogle = useCallback(async ({ idToken, rememberMe = false }) => {
    const tokenResponse = await authService.googleSignIn(idToken)
    const nextSession = storeSession(tokenResponse, rememberMe)

    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearAuthentication()
    }
  }, [clearAuthentication])

  const value = {
    user: session?.user || null,
    accessToken: session?.accessToken || null,
    isAuthenticated: Boolean(session?.accessToken),
    isAuthLoading,
    forcePasswordChange: Boolean(session?.forcePasswordChange),
    login,
    loginWithGoogle,
    logout,
    clearAuthentication,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
