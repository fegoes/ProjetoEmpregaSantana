import * as React from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database, UserRole } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  roles: UserRole[]
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    initialRole: UserRole,
    fullName?: string,
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  addRole: (role: UserRole) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

async function loadProfileAndRoles(userId: string) {
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_roles').select('role').eq('user_id', userId),
  ])

  return {
    profile: profile ?? null,
    roles: (roleRows ?? []).map((r) => r.role as UserRole),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [roles, setRoles] = React.useState<UserRole[]>([])
  const [loading, setLoading] = React.useState(true)

  const hydrate = React.useCallback(async (nextSession: Session | null) => {
    setSession(nextSession)

    if (!nextSession?.user) {
      setProfile(null)
      setRoles([])
      return
    }

    const { profile: nextProfile, roles: nextRoles } = await loadProfileAndRoles(
      nextSession.user.id,
    )

    if (!nextProfile || !nextProfile.is_active) {
      await supabase.auth.signOut()
      setSession(null)
      setProfile(null)
      setRoles([])
      return
    }

    setProfile(nextProfile)
    setRoles(nextRoles)
  }, [])

  React.useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      hydrate(data.session).finally(() => setLoading(false))
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrate(nextSession)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [hydrate])

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    if (data.user) {
      const { data: activeCheck } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', data.user.id)
        .single()
      if (!activeCheck || !activeCheck.is_active) {
        await supabase.auth.signOut()
        return { error: 'Sua conta foi desativada. Entre em contato com o suporte.' }
      }
    }

    return { error: null }
  }

  const signUp: AuthContextValue['signUp'] = async (email, password, initialRole, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) return { error: error.message }
    if (!data.user) return { error: null }

    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role: initialRole })

    return { error: roleError?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const addRole: AuthContextValue['addRole'] = async (role) => {
    if (!session?.user) return { error: 'Não autenticado' }
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: session.user.id, role })
    if (!error) await hydrate(session)
    return { error: error?.message ?? null }
  }

  const refreshProfile = async () => {
    await hydrate(session)
  }

  const requestPasswordReset: AuthContextValue['requestPasswordReset'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    return { error: error?.message ?? null }
  }

  const updatePassword: AuthContextValue['updatePassword'] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message ?? null }
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    roles,
    isAdmin: profile?.is_admin ?? false,
    loading,
    signIn,
    signUp,
    signOut,
    addRole,
    refreshProfile,
    requestPasswordReset,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
