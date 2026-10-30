import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Handshake } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useMinhaEmpresa } from '@/hooks/useEmpresas'
import { mensagemDeErro, useIniciarContratacao } from '@/hooks/useProcessos'

/**
 * "Contratar pela plataforma", no perfil de um autônomo. Só aparece para empresa ativa: abre um acompanhamento
 * com etapas (conversa, proposta, documentos, contratação) que os dois lados seguem dentro do site.
 */
export function IniciarContratacao({ autonomoId, nome, className }: { autonomoId: string; nome: string; className?: string }) {
  const { user, roles } = useAuth()
  const navigate = useNavigate()
  const ehEmpresa = roles.includes('empresa_owner')
  const { data: empresa } = useMinhaEmpresa(user?.id, ehEmpresa)
  const iniciar = useIniciarContratacao()
  const [aberto, setAberto] = React.useState(false)
  const [mensagem, setMensagem] = React.useState('')
  const [erro, setErro] = React.useState<string | null>(null)

  if (!user || !ehEmpresa || !empresa || empresa.status !== 'active' || user.id === autonomoId) return null
  const primeiroNome = nome.split(' ')[0]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    iniciar.mutate(
      { empresaId: empresa.id, autonomoId, mensagem },
      {
        onSuccess: (id) => navigate(`/empresa/processos/${id}`),
        onError: (err) => setErro(mensagemDeErro(err, 'Não foi possível iniciar agora. Tente de novo.')),
      },
    )
  }

  return (
    <>
      <Button type="button" variant="outline" size="lg" className={className} onClick={() => setAberto(true)}>
        <Handshake /> Contratar pela plataforma
      </Button>
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent title="Contratar pela plataforma" description={nome}>
          <form onSubmit={submit} className="flex flex-col gap-4 pt-2">
            <p className="text-[15px]">
              Você e {primeiroNome} acompanham tudo por aqui: conversa inicial, proposta, documentos e contratação. As mensagens e os arquivos
              ficam registrados e só vocês dois abrem.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="primeira-mensagem">Primeira mensagem (opcional)</Label>
              <Textarea
                id="primeira-mensagem"
                rows={4}
                maxLength={4000}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder={`Olá, ${primeiroNome}! Preciso de um orçamento para…`}
              />
            </div>
            {erro && (
              <p role="alert" className="text-sm text-destructive-ink">
                {erro}
              </p>
            )}
            <Button type="submit" size="lg" disabled={iniciar.isPending}>
              {iniciar.isPending ? 'Iniciando…' : 'Iniciar contratação'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
