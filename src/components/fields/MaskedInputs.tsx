import * as React from 'react'
import { Input } from '@/components/ui/input'
import { formatMoneyInput, maskCnpj, maskPhone, parseMoneyInput } from '@/lib/masks'

type BaseProps = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>

interface MaskedProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  mask: (value: string) => string
}

/** Campo de texto que formata enquanto a pessoa digita. */
export function MaskedInput({ value, onChange, mask, ...props }: MaskedProps) {
  return <Input {...props} value={value} onChange={(e) => onChange(mask(e.target.value))} />
}

export function PhoneInput(props: Omit<MaskedProps, 'mask'>) {
  return (
    <MaskedInput
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="(82) 99999-0000"
      maxLength={15}
      {...props}
      mask={maskPhone}
    />
  )
}

export function CnpjInput(props: Omit<MaskedProps, 'mask'>) {
  return (
    <MaskedInput inputMode="numeric" placeholder="00.000.000/0000-00" maxLength={18} {...props} mask={maskCnpj} />
  )
}

interface CurrencyInputProps extends Omit<BaseProps, 'type'> {
  /** Valor em reais (1518 = R$ 1.518,00) ou null quando vazio. */
  value: number | null
  onChange: (value: number | null) => void
}

/** Valor em reais: mostra "R$ 1.518,00" e entrega um número. Os dígitos entram da direita, como numa maquininha. */
export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  return (
    <Input
      inputMode="numeric"
      autoComplete="off"
      placeholder="R$ 0,00"
      {...props}
      value={formatMoneyInput(value)}
      onChange={(e) => onChange(parseMoneyInput(e.target.value))}
    />
  )
}
