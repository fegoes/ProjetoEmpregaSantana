import { useParams } from 'react-router-dom'
import { Briefcase, GraduationCap, Mail, MapPin, Phone } from 'lucide-react'
import { useVagaCandidaturas, useUpdateCandidaturaStatus } from '@/hooks/useEmpresaVagas'
import type { CandidaturaStatus } from '@/types/database'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const NEXT_STATUS: Partial<Record<CandidaturaStatus, CandidaturaStatus>> = {
  enviada: 'em_analise',
  em_analise: 'entrevista',
  entrevista: 'aprovada',
}

export default function VagaCandidatosPage() {
  const { id } = useParams<{ id: string }>()
  const { data: candidaturas, isLoading } = useVagaCandidaturas(id)
  const updateStatus = useUpdateCandidaturaStatus()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Candidatos</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="flex flex-col gap-4">
        {candidaturas?.map((c) => {
          const nextStatus = NEXT_STATUS[c.status]
          const cv = c.cv_variants
          return (
            <Card key={c.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {c.candidato_profiles?.profiles?.full_name ?? 'Candidato'} — {cv?.title}
                </CardTitle>
                <StatusBadge status={c.status} />
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

                <div className="flex gap-3 border-t pt-3 text-sm">
                  {nextStatus && (
                    <button
                      className="font-medium text-primary hover:underline"
                      onClick={() => id && updateStatus.mutate({ id: c.id, status: nextStatus, vagaId: id })}
                    >
                      Avançar para "{nextStatus}"
                    </button>
                  )}
                  {c.status !== 'rejeitada' && (
                    <button
                      className="font-medium text-destructive hover:underline"
                      onClick={() => id && updateStatus.mutate({ id: c.id, status: 'rejeitada', vagaId: id })}
                    >
                      Rejeitar
                    </button>
                  )}
                </div>
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
