type Environment = { url: string; anonKey: string; serviceKey: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const publicRoles = ['candidato', 'autonomo', 'empresa_owner']
export function usersHandler(env: Environment, requestFetch: typeof fetch = fetch) {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Cache-Control': 'no-store' }
  return async (request: Request): Promise<Response> => {
    const reply = (status: number, body: object) => Response.json(body, { status, headers: cors })
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'POST') return reply(405, { error: 'Método não permitido.' })
    if (!env.url || !env.anonKey || !env.serviceKey) return reply(503, { error: 'Serviço de usuários indisponível.' })
    const authorization = request.headers.get('authorization') ?? ''
    if (!/^Bearer \S+$/.test(authorization)) return reply(401, { error: 'Entre novamente.' })
    try {
      const text = await request.text()
      if (text.length > 12_000) return reply(413, { error: 'Solicitação muito grande.' })
      let input: Record<string, unknown>
      try { input = JSON.parse(text) } catch { return reply(400, { error: 'Solicitação inválida.' }) }
      if (!input || !['create','update','delete'].includes(String(input.action))) return reply(400, { error: 'Ação inválida.' })
      if (input.action !== 'create' && !uuid.test(String(input.userId ?? ''))) return reply(400, { error: 'Usuário inválido.' })
      if (input.action !== 'delete') {
        if (typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || typeof input.full_name !== 'string' || !input.full_name.trim() || input.full_name.length > 180) return reply(400, { error: 'Informe nome e e-mail válidos.' })
        if (!Array.isArray(input.roles) || input.roles.length > 3 || input.roles.some(role => !publicRoles.includes(String(role)))) return reply(400, { error: 'Perfis inválidos.' })
        if (input.action === 'create' && (typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 128)) return reply(400, { error: 'Use uma senha entre 12 e 128 caracteres.' })
        for (const key of ['phone','city','state']) if (input[key] != null && (typeof input[key] !== 'string' || String(input[key]).length > 180)) return reply(400, { error: 'Dados de contato inválidos.' })
        if (input.is_active != null && typeof input.is_active !== 'boolean') return reply(400, { error: 'Situação inválida.' })
      }
      const userHeaders = { apikey: env.anonKey, Authorization: authorization, 'Content-Type': 'application/json' }
      const auth = await requestFetch(`${env.url}/auth/v1/user`, { headers: userHeaders })
      if (!auth.ok) return reply(401, { error: 'Sessão inválida ou expirada.' })
      const caller = await auth.json()
      const profile = await requestFetch(`${env.url}/rest/v1/profiles?id=eq.${encodeURIComponent(caller.id)}&select=id,is_admin,is_active`, { headers: userHeaders })
      const rows = profile.ok ? await profile.json() : []
      if (rows.length !== 1 || rows[0].id !== caller.id || rows[0].is_admin !== true || rows[0].is_active !== true) return reply(403, { error: 'Acesso reservado ao superadmin.' })
      if (caller.factors?.some((factor: { status: string }) => factor.status === 'verified')) {
        const payload = JSON.parse(atob(authorization.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        if (payload.aal !== 'aal2') return reply(403, { error: 'Confirme a autenticação em dois fatores.' })
      }
      const serviceHeaders = { apikey: env.serviceKey, Authorization: `Bearer ${env.serviceKey}`, 'Content-Type': 'application/json' }
      if (input.action === 'delete') {
        if (input.userId === caller.id) return reply(409, { error: 'Você não pode excluir sua própria conta.' })
        const target = await requestFetch(`${env.url}/rest/v1/profiles?id=eq.${input.userId}&select=id,is_admin`, { headers: serviceHeaders })
        if (!target.ok) return reply(503, { error: 'Não foi possível consultar a conta.' })
        const targets = await target.json()
        if (!targets.length) return reply(404, { error: 'Conta não encontrada.' })
        if (targets[0].is_admin) return reply(409, { error: 'Revogue o acesso administrativo por operação privilegiada antes de excluir esta conta.' })
        const result = await requestFetch(`${env.url}/auth/v1/admin/users/${input.userId}`, { method: 'DELETE', headers: serviceHeaders })
        return result.ok ? reply(200, { ok: true }) : reply(409, { error: 'Não foi possível excluir. Transfira ou exclua as empresas e vagas sob responsabilidade desta conta primeiro.' })
      }
      if (input.userId === caller.id && input.is_active === false) return reply(409, { error: 'Você não pode desativar sua própria conta.' })
      let userId = String(input.userId ?? '')
      if (input.action === 'create') {
        const created = await requestFetch(`${env.url}/auth/v1/admin/users`, { method: 'POST', headers: serviceHeaders, body: JSON.stringify({ email: String(input.email).trim(), password: input.password, email_confirm: true, user_metadata: { full_name: String(input.full_name).trim() } }) })
        if (!created.ok) return reply(409, { error: 'Não foi possível criar a conta. Confira se o e-mail já existe e se a senha atende à política do sistema.' })
        const createdUser = await created.json()
        userId = createdUser.id
        if (!uuid.test(userId)) return reply(502, { error: 'O serviço retornou uma conta inválida.' })
      }
      const saved = await requestFetch(`${env.url}/rest/v1/rpc/admin_save_person`, { method: 'POST', headers: userHeaders, body: JSON.stringify({ p_user_id: userId, p_details: { full_name: input.full_name, phone: input.phone ?? '', city: input.city ?? '', state: input.state ?? '', is_active: input.is_active ?? true }, p_roles: input.roles }) })
      if (!saved.ok) {
        if (input.action === 'create') {
          const cleanup = await requestFetch(`${env.url}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: serviceHeaders }).catch(() => null)
          if (!cleanup?.ok) return reply(409, { error: 'A conta foi criada, mas o perfil ficou incompleto. Localize o usuário na lista para corrigir; não repita a criação.' })
        }
        return reply(400, { error: 'Não foi possível salvar o perfil. Confira os dados e a disponibilidade do cadastro administrativo.' })
      }
      if (input.action === 'update') {
        const updated = await requestFetch(`${env.url}/auth/v1/admin/users/${userId}`, { method: 'PUT', headers: serviceHeaders, body: JSON.stringify({ email: String(input.email).trim(), email_confirm: true, user_metadata: { full_name: String(input.full_name).trim() } }) })
        if (!updated.ok) return reply(409, { error: 'O perfil foi salvo, mas o e-mail não foi alterado. Confira se já existe outra conta com esse endereço.' })
      }
      return reply(200, { ok: true, userId })
    } catch { return reply(500, { error: 'Não foi possível concluir. Atualize a lista para conferir o estado antes de tentar novamente.' }) }
  }
}
