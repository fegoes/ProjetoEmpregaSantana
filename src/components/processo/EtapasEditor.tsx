import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { ETAPAS_MAX, ETAPA_TIPOS, ETAPA_TIPOS_DO_MEIO, MODELO_PADRAO, type EtapaModelo } from '@/lib/hiring'
import { moveItem } from '@/lib/utils'

interface EtapasEditorProps {
  value: EtapaModelo[]
  onChange: (value: EtapaModelo[]) => void
}

const rotuloDoTipo = (tipo: EtapaModelo['tipo']) => ETAPA_TIPOS.find((t) => t.value === tipo)?.label ?? ''

/**
 * Etapas que a pessoa acompanha depois de se candidatar. A primeira (candidatura recebida) e a última
 * (contratação) são fixas; as do meio a empresa escolhe, nomeia e ordena.
 */
export function EtapasEditor({ value, onChange }: EtapasEditorProps) {
  const update = (index: number, patch: Partial<EtapaModelo>) => onChange(value.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  const last = value.length - 1

  const add = () => {
    const nova: EtapaModelo = { tipo: 'outra', titulo: '', descricao: '' }
    onChange([...value.slice(0, last), nova, value[last]])
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col divide-y border-y">
        {value.map((etapa, index) => {
          const fixa = index === 0 || index === last
          return (
            <li key={index} className="flex gap-3 py-3">
              <span aria-hidden className="mt-6 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold tabular-nums">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className={fixa ? 'flex flex-col gap-1.5' : 'grid gap-3 sm:grid-cols-2'}>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`etapa-titulo-${index}`} className="text-xs text-muted-foreground">
                      {fixa ? `Etapa fixa: ${rotuloDoTipo(etapa.tipo)}` : `Nome da etapa ${index + 1}`}
                    </Label>
                    <Input
                      id={`etapa-titulo-${index}`}
                      value={etapa.titulo}
                      maxLength={80}
                      placeholder="Ex.: Entrevista com o gerente"
                      onChange={(e) => update(index, { titulo: e.target.value })}
                    />
                  </div>
                  {!fixa && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`etapa-tipo-${index}`} className="text-xs text-muted-foreground">
                        Tipo da etapa
                      </Label>
                      <NativeSelect id={`etapa-tipo-${index}`} value={etapa.tipo} onChange={(e) => update(index, { tipo: e.target.value as EtapaModelo['tipo'] })}>
                        {ETAPA_TIPOS_DO_MEIO.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`etapa-desc-${index}`} className="text-xs text-muted-foreground">
                    O que acontece nesta etapa (a pessoa lê)
                  </Label>
                  <Input
                    id={`etapa-desc-${index}`}
                    value={etapa.descricao}
                    maxLength={300}
                    onChange={(e) => update(index, { descricao: e.target.value })}
                  />
                </div>
                {!fixa && (
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <Button type="button" variant="ghost" size="sm" disabled={index <= 1} onClick={() => onChange(moveItem(value, index, -1))}>
                      <ArrowUp /> Subir
                    </Button>
                    <Button type="button" variant="ghost" size="sm" disabled={index >= last - 1} onClick={() => onChange(moveItem(value, index, 1))}>
                      <ArrowDown /> Descer
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive-ink"
                      onClick={() => onChange(value.filter((_, i) => i !== index))}
                    >
                      <Trash2 /> Apagar etapa
                    </Button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={value.length >= ETAPAS_MAX} onClick={add}>
          <Plus /> Adicionar etapa
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(MODELO_PADRAO.map((e) => ({ ...e })))}>
          <RotateCcw /> Voltar ao padrão
        </Button>
      </div>
    </div>
  )
}
