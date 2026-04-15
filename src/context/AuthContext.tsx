import {
  onAuthStateChanged,
  reload,
  type User,
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { auth } from '../firebase/config'
import { authService } from '../services/authService'
import {
  createUserProfile,
  getUserProfile,
  syncEmailVerificationStatus,
} from '../services/userService'
import type { AccessStatus, AuthContextData, RegisterFormData } from '../types/auth'
import type { UsuarioPerfil } from '../types/user'

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UsuarioPerfil | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setProfile(null)
      return
    }

    await syncEmailVerificationStatus(firebaseUser.uid, firebaseUser.emailVerified)

    const profileData = await getUserProfile(firebaseUser.uid)

    setProfile(
      profileData
        ? {
            ...profileData,
            emailVerificado:
              firebaseUser.emailVerified || profileData.emailVerificado,
          }
        : null,
    )
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true)

      try {
        if (!currentUser) {
          setUser(null)
          setProfile(null)
          return
        }

        await reload(currentUser)

        const refreshedUser = auth.currentUser
        setUser(refreshedUser)
        await loadProfile(refreshedUser)
      } finally {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [loadProfile])

  const signUp = useCallback(
    async (data: RegisterFormData) => {
      setIsLoading(true)

      try {
        const firebaseUser = await authService.register(data.email, data.senha)
        await createUserProfile(firebaseUser.uid, data, firebaseUser.emailVerified)
        setUser(firebaseUser)
        await loadProfile(firebaseUser)
      } finally {
        setIsLoading(false)
      }
    },
    [loadProfile],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)

      try {
        const firebaseUser = await authService.login(email, password)
        setUser(firebaseUser)
        await loadProfile(firebaseUser)
      } finally {
        setIsLoading(false)
      }
    },
    [loadProfile],
  )

  const signOutUser = useCallback(async () => {
    setIsLoading(true)

    try {
      await authService.logout()
      setUser(null)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendResetPassword = useCallback(async (email: string) => {
    await authService.sendPasswordReset(email)
  }, [])

  const resendVerification = useCallback(async () => {
    await authService.resendVerificationEmail()
  }, [])

  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser

    if (!currentUser) {
      setUser(null)
      setProfile(null)
      return
    }

    setIsLoading(true)

    try {
      await reload(currentUser)
      const refreshedUser = auth.currentUser
      setUser(refreshedUser)
      await loadProfile(refreshedUser)
    } finally {
      setIsLoading(false)
    }
  }, [loadProfile])

  const accessStatus: AccessStatus = isLoading
    ? 'loading'
    : !user
      ? 'logged-out'
      : !user.emailVerified
        ? 'verify-email'
        : !profile || profile.statusAprovacao !== 'aprovado'
          ? 'pending-approval'
          : 'approved'

  const value = useMemo<AuthContextData>(
    () => ({
      user,
      profile,
      isLoading,
      accessStatus,
      signUp,
      signIn,
      signOutUser,
      sendResetPassword,
      resendVerification,
      refreshProfile,
    }),
    [
      accessStatus,
      isLoading,
      profile,
      refreshProfile,
      resendVerification,
      sendResetPassword,
      signIn,
      signOutUser,
      signUp,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
