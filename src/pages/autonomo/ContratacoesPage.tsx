import { Handshake } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { EmptyState } from '@/components/EmptyState'
import { ListaProcessos } from '@/components/processo/ListaProcessos'
import { Button } from '@/components/ui/button'
import { useLeituras, useProcessos } from '@/hooks/useProcessos'

/** Contratações que empresas abriram com o autônomo: conversa, proposta, documentos e contratação. */
export default function AutonomoContratacoesPage() {
  const { user } = useAuth()
  const { data: processos, isLoading, isError, refetch } = useProcessos(user ? { tipo: 'pessoa', userId: user.id, origem: 'autonomo' } : undefined)
  const { data: leituras } = useLeituras(user?.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Contratações</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Quando uma empresa quer contratar o seu serviço pela plataforma, o acompanhamento aparece aqui: conversa, proposta e documentos.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Não conseguimos carregar suas contratações.</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {processos && processos.length > 0 && (
        <ListaProcessos processos={processos} userId={user?.id ?? ''} leituras={leituras} ladoEmpresa={false} href={(p) => `/autonomo/contratacoes/${p.id}`} />
      )}

      {processos?.length === 0 && (
        <EmptyState
          icon={Handshake}
          title="Nenhuma contratação ainda"
          description="Mantenha seu perfil completo e com fotos do seu trabalho: é o que faz as empresas chamarem você."
        />
      )}
    </div>
  )
}
