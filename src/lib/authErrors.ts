// O Supabase Auth devolve mensagens em inglês ("Invalid login credentials").
// Aqui elas viram texto em português que diz o problema e o que fazer.

const RULES: { test: RegExp; message: string }[] = [
  { test: /invalid login credentials/i, message: 'E-mail ou senha incorretos. Confira e tente de novo.' },
  {
    test: /email not confirmed/i,
    message: 'Confirme seu e-mail antes de entrar: abra o link que enviamos para a sua caixa de entrada.',
  },
  {
    test: /already registered|already been registered|user already exists/i,
    message: 'Já existe uma conta com este e-mail. Entre ou use "Esqueci minha senha".',
  },
  { test: /password should be at least|password.*(short|length)/i, message: 'A senha precisa ter pelo menos 6 caracteres.' },
  {
    test: /same password|different from the old password/i,
    message: 'A nova senha precisa ser diferente da atual.',
  },
  { test: /unable to validate email|invalid email|email address .* is invalid/i, message: 'Este e-mail não parece válido. Confira se digitou certo.' },
  {
    test: /rate limit|too many requests|for security purposes|only request this after/i,
    message: 'Muitas tentativas seguidas. Espere um minuto e tente de novo.',
  },
  { test: /failed to fetch|network|load failed/i, message: 'Sem conexão com a internet. Verifique sua rede e tente de novo.' },
  { test: /session.*(missing|expired)|auth session missing|jwt expired/i, message: 'Sua sessão expirou. Entre de novo para continuar.' },
]

export function translateAuthError(message: string | null | undefined): string | null {
  if (!message) return null
  const rule = RULES.find((r) => r.test.test(message))
  return rule ? rule.message : 'Não foi possível concluir agora. Tente de novo em instantes.'
}
