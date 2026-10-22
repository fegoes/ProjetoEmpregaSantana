// Tela de última instância: aparece quando faltam as variáveis do Supabase.
// Não usa nenhum token nem componente do projeto de propósito — se a
// configuração está quebrada, o resto do app pode não ter carregado.
export function ConfiguracaoAusente() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: '#F8F8F8',
        color: '#333333',
        fontFamily: 'Poppins, system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '34rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
          Configuração do servidor ausente
        </h1>
        <p style={{ marginTop: '0.9rem', lineHeight: 1.6 }}>
          O aplicativo não encontrou as credenciais do Supabase, então não consegue
          carregar vagas, perfis nem autenticação.
        </p>
        <p style={{ marginTop: '0.9rem', lineHeight: 1.6 }}>
          Em desenvolvimento, copie <code>.env.example</code> para{' '}
          <code>.env.local</code> e preencha <code>VITE_SUPABASE_URL</code> e{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>. Em produção, defina essas duas
          variáveis no ambiente de build — elas são embutidas no bundle pelo Vite,
          então exigem um novo deploy depois de configuradas.
        </p>
      </div>
    </div>
  )
}
