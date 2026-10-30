import { Link, useLocation } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

// Sem esta rota, qualquer endereço não reconhecido renderizava uma página
// totalmente vazia — nem navbar, nem rodapé, nem mensagem.
export default function NaoEncontradaPage() {
  const { pathname } = useLocation()

  useDocumentMeta({
    title: 'Página não encontrada',
    description: 'O endereço acessado não existe no EmpregaSantana.',
  })

  return (
    <div className="py-10">
      <EmptyState
        icon={Compass}
        title="Não encontramos esta página"
        description={`O endereço ${pathname} não existe ou foi movido. As vagas e os profissionais continuam disponíveis.`}
        action={
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild variant="cta">
              <Link to="/explorar">Ver vagas e profissionais</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Ir para o início</Link>
            </Button>
          </div>
        }
      />
    </div>
  )
}
