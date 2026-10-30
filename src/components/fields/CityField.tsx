import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { useMunicipios } from '@/hooks/useMunicipios'
import { DEFAULT_UF, UFS, titleCasePt } from '@/lib/masks'

interface CityFieldProps {
  /** id do campo de cidade (o <Label htmlFor> da página aponta para ele) */
  id: string
  city: string
  uf: string
  onChange: (value: { city: string; uf: string }) => void
  required?: boolean
}

const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Estado + cidade. As cidades do estado aparecem como sugestão (lista oficial do IBGE) e o nome é arrumado ao sair do campo. */
export function CityField({ id, city, uf, onChange, required }: CityFieldProps) {
  const currentUf = uf || DEFAULT_UF
  const { data: municipios } = useMunicipios(currentUf)

  const normalizeCity = () => {
    const typed = city.trim()
    if (!typed) return
    const official = municipios?.find((name) => plain(name) === plain(typed))
    const next = official ?? titleCasePt(typed)
    if (next !== city) onChange({ city: next, uf: currentUf })
  }

  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2">
      <NativeSelect
        aria-label="Estado (UF)"
        autoComplete="address-level1"
        value={currentUf}
        onChange={(e) => onChange({ city, uf: e.target.value })}
      >
        {UFS.map((sigla) => (
          <option key={sigla} value={sigla}>
            {sigla}
          </option>
        ))}
      </NativeSelect>
      <Input
        id={id}
        list={`${id}-cidades`}
        autoComplete="address-level2"
        autoCapitalize="words"
        required={required}
        placeholder="Santana do Ipanema"
        value={city}
        onChange={(e) => onChange({ city: e.target.value, uf: currentUf })}
        onBlur={normalizeCity}
      />
      <datalist id={`${id}-cidades`}>
        {(municipios ?? []).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  )
}
