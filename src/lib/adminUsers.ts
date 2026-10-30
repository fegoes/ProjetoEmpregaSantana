import { supabase } from '@/lib/supabase'

export async function manageAdminUser(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; userId?: string; error?: string }>('admin-users', { body })
  if (error) {
    const response = 'context' in error ? error.context : null
    if (response instanceof Response) {
      const result = await response.json().catch(() => null)
      if (result?.error) throw new Error(result.error)
    }
    throw new Error('O serviço de usuários está indisponível. Confira a sessão e a publicação da função administrativa.')
  }
  if (!data?.ok) throw new Error(data?.error ?? 'Não foi possível concluir a operação.')
  return data
}

export function adminError(error: unknown) {
  if (error instanceof Error) return error.message
  const code = (error as { code?: string })?.code
  if (code === '23505') return 'Este cadastro já existe. Confira os dados informados.'
  if (code === '23503' || code === '23001') return 'O cadastro possui vínculos. Confira os registros associados antes de excluir.'
  if (code === '42501') return 'Acesso reservado ao superadmin. Entre novamente.'
  if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01') return 'Este recurso ainda precisa da atualização do banco. Avise o responsável pela plataforma.'
  return 'Não foi possível salvar. Confira os campos e tente novamente.'
}
