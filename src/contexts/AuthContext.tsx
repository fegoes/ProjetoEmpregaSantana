import { confirmationRedirect } from '@/lib/authFlow'
import * as React from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { hasAdminAccess, isPublicRole } from '@/lib/accessControl'
import { translateAuthError } from '@/lib/authErrors'
import { landingPathFor, type PanelUser } from '@/lib/panelNav'
import { queryClient } from '@/lib/queryClient'
import type { Database, UserRole } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  roles: UserRole[]
  isAdmin: boolean
  loading: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null; destination?: string; access?: PanelUser }>
  signUp: (
    email: string,
    password: string,
    initialRole: UserRole,
    fullName?: string,
    phone?: string,
    redirect?: string,
  ) => Promise<{ error: string | null; confirmationRequired?: boolean }>
  signOut: () => Promise<void>
  addRole: (role: UserRole) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

async function loadProfileAndRoles(userId: string) {
  const [{ data: profile, error: profileError }, { data: roleRows, error: rolesError }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_roles').select('role').eq('user_id', userId),
  ])

  if (profileError || rolesError) throw profileError ?? rolesError
  if (!profile) throw new Error('Perfil não encontrado')
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

  const [authError,setAuthError] = React.useState<string|null>(null)
  const hydrationVersion = React.useRef(0)
  const sessionUserId = React.useRef<string | null>(null)
  const validatedSession = React.useRef<{ userId: string; token: string } | null>(null)
  const hydrate = React.useCallback(async (nextSession: Session | null, defer = false) => {
    const version = ++hydrationVersion.current
    validatedSession.current = null
    const nextUserId = nextSession?.user.id ?? null
    setLoading(true)
    setAuthError(null)
    setSession(nextSession)
    setProfile(null)
    setRoles([])
    if (sessionUserId.current !== nextUserId) {
      queryClient.clear()
      sessionUserId.current = nextUserId
    }
    try {
      if (!nextSession?.user) return
      if (defer) await new Promise(resolve=>setTimeout(resolve,0))
      if (version !== hydrationVersion.current) return
      const { profile: nextProfile, roles: nextRoles } = await loadProfileAndRoles(nextSession.user.id)
      if (version !== hydrationVersion.current) return
      if (!nextProfile.is_active) {
        await supabase.auth.signOut()
        if (version === hydrationVersion.current) setSession(null)
        return
      }
      setProfile(nextProfile)
      setRoles(nextRoles)
      validatedSession.current = { userId: nextSession.user.id, token: nextSession.access_token }
    } catch {
      if (version === hydrationVersion.current) setAuthError('Não foi possível carregar seus dados. Confira a conexão e tente novamente.')
    } finally {
      if (version === hydrationVersion.current) setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      hydrate(data.session)
    }).catch(() => {
      if (isMounted) hydrate(null)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Supabase can repeat SIGNED_IN on focus or across tabs. A session already
      // validated with this exact token must not unmount in-progress forms.
      // New tokens, account changes, explicit refreshes and sign-out still hydrate.
      if (event === 'SIGNED_IN' && nextSession?.access_token && validatedSession.current?.userId === nextSession.user.id && validatedSession.current.token === nextSession.access_token) return
      void hydrate(nextSession, true)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [hydrate])

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: translateAuthError(error.message) }

    let destination: string | undefined
    let access: PanelUser | undefined
    if (data.user) {
      const [{ data: profileRow, error: profileError }, { data: roleRows, error: rolesError }] = await Promise.all([
        supabase.from('profiles').select('is_active, is_admin').eq('id', data.user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', data.user.id),
      ])
      if (profileError || rolesError || !profileRow) return { error: 'Não foi possível carregar seu perfil. Tente novamente.' }
      if (!profileRow.is_active) {
        await supabase.auth.signOut()
        return { error: 'Sua conta foi desativada. Entre em contato com o suporte.' }
      }
      access = { isAdmin: profileRow.is_admin, roles: (roleRows ?? []).map((r) => r.role as UserRole) }
      destination = landingPathFor(access)
    }

    return { error: null, destination, access }
    } catch { return { error: 'Não foi possível entrar. Confira sua conexão e tente novamente.' } }
  }

  const signUp: AuthContextValue['signUp'] = async (email, password, initialRole, fullName, phone, redirect) => {
    if (!isPublicRole(initialRole)) return { error: 'Escolha um perfil público válido.' }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: confirmationRedirect(redirect), data: { full_name: fullName?.trim(), contact_phone: phone, initial_role: initialRole } },
      })
      if (error) return { error: translateAuthError(error.message) }
      // Com confirmação ativa não há sessão. Nunca tente escrever user_roles
      // pelo navegador anônimo: handle_new_user realiza isso atomicamente.
      if (data.session) {
        await supabase.auth.signOut()
        return { error: 'O serviço não exigiu confirmação de e-mail. A equipe precisa revisar a configuração de confirmação antes de continuar.' }
      }
      return { error: null, confirmationRequired: true }
    } catch { return { error: 'Não foi possível criar a conta. Confira a conexão e tente novamente.' } }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const addRole: AuthContextValue['addRole'] = async (role) => {
    if (!isPublicRole(role)) return { error: 'Este perfil não está disponível para cadastro.' }
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
    profile: profile?.id === session?.user.id ? profile : null,
    roles: profile?.id === session?.user.id ? roles : [],
    isAdmin: hasAdminAccess(session?.user ?? null, profile),
    loading,
    authError,
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
