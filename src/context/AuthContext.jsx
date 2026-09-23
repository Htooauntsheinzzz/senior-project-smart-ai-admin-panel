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
    const nextSession = normalizeSession(tokenResponse, rememberMe)

    if (!nextSession.accessToken || !nextSession.refreshToken) {
      throw new Error('Invalid authentication response.')
    }

    setTokenSession(nextSession, rememberMe)
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
    logout,
    clearAuthentication,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
