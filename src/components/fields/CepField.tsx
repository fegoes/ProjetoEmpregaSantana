import * as React from 'react'
import { Input } from '@/components/ui/input'
import { addressLineFromCep, lookupCep, type CepAddress } from '@/lib/cep'
import { isCompleteCep, maskCep, onlyDigits } from '@/lib/masks'

type Status = 'idle' | 'loading' | 'found' | 'notfound' | 'error'

interface CepFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  /** Chamado quando o CEP digitado existe: a página preenche rua, bairro, cidade e estado. */
  onFound?: (address: CepAddress) => void
}

/** CEP com máscara e busca automática do endereço quando os 8 dígitos são digitados. */
export function CepField({ id, value, onChange, onFound }: CepFieldProps) {
  const [status, setStatus] = React.useState<Status>('idle')
  const [found, setFound] = React.useState<CepAddress | null>(null)
  const controller = React.useRef<AbortController | null>(null)

  React.useEffect(() => () => controller.current?.abort(), [])

  const handleChange = (raw: string) => {
    const masked = maskCep(raw)
    onChange(masked)
    if (!isCompleteCep(masked) || onlyDigits(masked) === onlyDigits(value)) {
      if (!isCompleteCep(masked)) {
        setStatus('idle')
        setFound(null)
      }
      return
    }
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setStatus('loading')
    lookupCep(masked, current.signal)
      .then((address) => {
        if (current.signal.aborted) return
        if (!address) {
          setStatus('notfound')
          setFound(null)
          return
        }
        setFound(address)
        setStatus('found')
        onFound?.(address)
      })
      .catch(() => {
        if (!current.signal.aborted) setStatus('error')
      })
  }

  const message =
    status === 'loading'
      ? 'Buscando o endereço…'
      : status === 'found' && found
        ? `${addressLineFromCep(found) || 'CEP encontrado'} · ${found.city}/${found.uf}`
        : status === 'notfound'
          ? 'Não encontramos esse CEP. Preencha o endereço abaixo.'
          : status === 'error'
            ? 'Não foi possível buscar agora. Preencha o endereço abaixo.'
            : null

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="00000-000"
        maxLength={9}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        aria-describedby={message ? `${id}-status` : undefined}
      />
      {message && (
        <p id={`${id}-status`} role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  )
}
