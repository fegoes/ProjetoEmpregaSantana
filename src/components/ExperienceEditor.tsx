import { useState } from 'react'
import { FieldDialog } from './forms/FieldDialog'
import { confirmAction } from '@/lib/confirmAction'
import { Plus, Trash2 } from 'lucide-react'
import type { CvExperience } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ExperienceEditorProps {
  value: CvExperience[]
  onChange: (value: CvExperience[]) => void
}

function emptyExperience(): CvExperience {
  return {
    id: crypto.randomUUID(),
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  }
}

export function ExperienceEditor({ value, onChange }: ExperienceEditorProps) {
  const [created, setCreated] = useState<string | null>(null)
  const update = (id: string, patch: Partial<CvExperience>) => {
    onChange(value.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp)))
  }
  const remove = async (id: string) => { if(await confirmAction('Remover esta experiência do currículo?')) onChange(value.filter((exp) => exp.id !== id)) }
  const add = () => { const item=emptyExperience();setCreated(item.id);onChange([...value,item]) }

  return (
    <div className="flex flex-col gap-4">
      {value.map((exp, index) => (
        <FieldDialog key={exp.id} kind="work" defaultOpen={created===exp.id} label={exp.role || `Experiência ${index + 1}`} summary={exp.company || 'Completar informações'}><div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Experiência {index + 1}</p>
            <button
              type="button"
              onClick={() => remove(exp.id)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remover experiência"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`exp-field-1-${exp.id}`}>Cargo</Label>
              <Input id={`exp-field-1-${exp.id}`}
                placeholder="Ex.: Auxiliar de produção"
                value={exp.role}
                onChange={(e) => update(exp.id, { role: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`exp-field-2-${exp.id}`}>Empresa</Label>
              <Input id={`exp-field-2-${exp.id}`}
                placeholder="Ex.: Laticínio Vale Verde"
                value={exp.company}
                onChange={(e) => update(exp.id, { company: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`exp-field-3-${exp.id}`}>Início</Label>
              <Input id={`exp-field-3-${exp.id}`}
                placeholder="Ex.: Jan 2022"
                value={exp.startDate}
                onChange={(e) => update(exp.id, { startDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`exp-field-4-${exp.id}`}>Fim</Label>
              <Input id={`exp-field-4-${exp.id}`}
                placeholder="Ex.: Dez 2023"
                value={exp.endDate}
                disabled={exp.current}
                onChange={(e) => update(exp.id, { endDate: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => update(exp.id, { current: e.target.checked, endDate: '' })}
            />
            Emprego atual
          </label>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`exp-desc-${exp.id}`}>O que você fazia nesse trabalho?</Label>
            <Textarea
              id={`exp-desc-${exp.id}`}
              rows={4}
              placeholder="Principais atividades"
              value={exp.description}
              onChange={(e) => update(exp.id, { description: e.target.value })}
            />
          </div>
        </div></FieldDialog>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit gap-1.5">
        <Plus className="size-4" /> Adicionar experiência
      </Button>
    </div>
  )
}
