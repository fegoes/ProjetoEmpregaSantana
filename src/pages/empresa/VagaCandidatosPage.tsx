import { Link, useParams } from 'react-router-dom'
import { Briefcase, GraduationCap, Mail, MapPin, MessagesSquare, Phone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useVagaCandidaturas } from '@/hooks/useEmpresaVagas'
import { useLeituras, useProcessos } from '@/hooks/useProcessos'
import { resumoAndamento, temNovidade } from '@/lib/hiring'
import { NovidadeTag, ProcessoBadge } from '@/components/processo/ProcessoBadge'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VagaCandidatosPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { empresa } = useEmpresa()
  const { data: candidaturas, isLoading } = useVagaCandidaturas(id)
  // Etapas, conversa e documentos de cada candidato ficam no processo dele
  const { data: processos } = useProcessos(empresa && id ? { tipo: 'empresa', empresaId: empresa.id, vagaId: id } : undefined)
  const { data: leituras } = useLeituras(user?.id)
  const processoDe = new Map((processos ?? []).map((p) => [p.candidatura_id, p]))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Candidatos</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="flex flex-col gap-4">
        {candidaturas?.map((c) => {
          const processo = processoDe.get(c.id)
          const cv = c.cv_variants
          return (
            <Card key={c.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {c.candidato_profiles?.profiles?.full_name ?? 'Candidato'} — {cv?.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {processo && temNovidade(processo, user?.id, leituras?.get(processo.id)) && <NovidadeTag />}
                  {processo ? <ProcessoBadge processo={processo} /> : <StatusBadge status={c.status} />}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {(cv?.contact_email || c.candidato_profiles?.profiles?.email) && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {cv?.contact_email || c.candidato_profiles?.profiles?.email}
                    </span>
                  )}
                  {cv?.contact_phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {cv.contact_phone}
                    </span>
                  )}
                  {cv?.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {cv.address}
                    </span>
                  )}
                </div>

                <RichTextRenderer html={cv?.summary_html} />

                {cv?.skills && cv.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cv.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="rounded-full">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {cv?.experiences && cv.experiences.length > 0 && (
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      <Briefcase className="size-3.5" /> Experiência profissional
                    </p>
                    <div className="flex flex-col gap-2">
                      {cv.experiences.map((exp) => (
                        <div key={exp.id} className="text-sm">
                          <p className="font-medium">
                            {exp.role} {exp.company && `— ${exp.company}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate} – {exp.current ? 'Atual' : exp.endDate}
                          </p>
                          {exp.description && <p className="mt-0.5 text-muted-foreground">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cv?.education && cv.education.length > 0 && (
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      <GraduationCap className="size-3.5" /> Formação acadêmica
                    </p>
                    <div className="flex flex-col gap-2">
                      {cv.education.map((edu) => (
                        <div key={edu.id} className="text-sm">
                          <p className="font-medium">
                            {edu.course} {edu.institution && `— ${edu.institution}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {edu.startDate} – {edu.current ? 'Cursando' : edu.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {processo && (
                  <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm">{resumoAndamento(processo, processo.etapas)}</p>
                    <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
                      <Link to={`/empresa/processos/${processo.id}`}>
                        <MessagesSquare /> Abrir acompanhamento
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      {candidaturas?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma candidatura recebida ainda.</p>
      )}
    </div>
  )
}
