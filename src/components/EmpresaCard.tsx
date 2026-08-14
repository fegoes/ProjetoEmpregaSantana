import { Link } from 'react-router-dom'
import { BadgeCheck, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InitialsAvatar } from '@/components/InitialsAvatar'

export interface EmpresaCardData {
  id: string
  nome_fantasia: string
  sector: string | null
  city: string | null
  state: string | null
  is_verified: boolean
  logo_url?: string | null
  vagas: { id: string; status: string }[] | null
}

export function EmpresaCard({ empresa }: { empresa: EmpresaCardData }) {
  const vagasAbertas = (empresa.vagas ?? []).filter((v) => v.status === 'published').length

  return (
    <Link to={`/empresas/${empresa.id}`} className="group block h-full">
      <Card className="h-full gap-3 overflow-hidden rounded-2xl py-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
        <CardHeader className="flex-row items-start gap-3">
          {empresa.logo_url ? (
            <img
              src={empresa.logo_url}
              alt={empresa.nome_fantasia}
              className="size-10 shrink-0 rounded-full border object-cover"
              loading="lazy"
              width={40}
              height={40}
            />
          ) : (
            <InitialsAvatar name={empresa.nome_fantasia} size="md" />
          )}
          <div className="min-w-0 pt-0.5">
            <h3 className="flex items-center gap-1.5 truncate text-[15px] leading-snug font-semibold">
              <span className="truncate">{empresa.nome_fantasia}</span>
              {empresa.is_verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{empresa.sector ?? 'Setor não informado'}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="rounded-full font-medium">
            {vagasAbertas} vaga{vagasAbertas === 1 ? '' : 's'} aberta{vagasAbertas === 1 ? '' : 's'}
          </Badge>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {[empresa.city, empresa.state].filter(Boolean).join(' — ') || 'Local não informado'}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
