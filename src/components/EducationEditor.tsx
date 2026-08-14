import { Plus, Trash2 } from 'lucide-react'
import type { CvEducation } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EducationEditorProps {
  value: CvEducation[]
  onChange: (value: CvEducation[]) => void
}

function emptyEducation(): CvEducation {
  return {
    id: crypto.randomUUID(),
    course: '',
    institution: '',
    startDate: '',
    endDate: '',
    current: false,
  }
}

export function EducationEditor({ value, onChange }: EducationEditorProps) {
  const update = (id: string, patch: Partial<CvEducation>) => {
    onChange(value.map((edu) => (edu.id === id ? { ...edu, ...patch } : edu)))
  }
  const remove = (id: string) => onChange(value.filter((edu) => edu.id !== id))
  const add = () => onChange([...value, emptyEducation()])

  return (
    <div className="flex flex-col gap-4">
      {value.map((edu, index) => (
        <div key={edu.id} className="flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Formação {index + 1}</p>
            <button
              type="button"
              onClick={() => remove(edu.id)}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remover formação"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Curso</Label>
              <Input value={edu.course} onChange={(e) => update(edu.id, { course: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Instituição</Label>
              <Input value={edu.institution} onChange={(e) => update(edu.id, { institution: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Início</Label>
              <Input
                placeholder="Ex.: 2019"
                value={edu.startDate}
                onChange={(e) => update(edu.id, { startDate: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Fim</Label>
              <Input
                placeholder="Ex.: 2023"
                value={edu.endDate}
                disabled={edu.current}
                onChange={(e) => update(edu.id, { endDate: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={edu.current}
              onChange={(e) => update(edu.id, { current: e.target.checked, endDate: '' })}
            />
            Cursando atualmente
          </label>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit gap-1.5">
        <Plus className="size-4" /> Adicionar formação
      </Button>
    </div>
  )
}
