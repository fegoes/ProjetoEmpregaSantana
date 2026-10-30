import * as React from 'react'
import { ImageUploadField } from '@/components/ImageUploadField'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { useEditorState } from '@/components/pages/editor/editorContext'
import { maskPhone } from '@/lib/masks'
import { PAGE_ICONS } from '@/lib/pageIcons'
import { linkProblem, resolveLink, type LinkMode, type LinkValue, type MediaRef } from '@/lib/pageLayout'
import { uploadPaginaImage } from '@/lib/storage'
import { cn } from '@/lib/utils'

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  // Quando o campo é um só (Input, Textarea, select) o rótulo é ligado a ele sozinho
  const autoId = React.useId()
  const only = React.isValidElement<{ id?: string }>(children) ? children : null
  const controlId = htmlFor ?? only?.props.id ?? autoId
  const control = only && !htmlFor && !only.props.id ? React.cloneElement(only, { id: autoId }) : children

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={controlId}>{label}</Label>
      {control}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Escolha entre poucas opções, em botões lado a lado. */
export function OptionGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  hint?: string
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm leading-none font-medium">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'h-10 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                active ? 'border-brand-ink bg-brand-ink text-white' : 'border-border bg-card hover:border-primary/50',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </fieldset>
  )
}

/** Escolha de cor, com uma amostra ao lado do nome. */
export function SwatchGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string; swatch: string }[]
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm leading-none font-medium">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                active ? 'border-primary bg-accent text-foreground' : 'border-border bg-card hover:border-primary/50',
              )}
            >
              <span aria-hidden className={cn('size-5 rounded-full border border-black/15', o.swatch)} />
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" className="size-4 shrink-0" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

/** Envio de imagem para a pasta da página. */
export function PageImageField({
  label,
  url,
  onChange,
  shape = 'banner',
  hint,
}: {
  label: string
  url: string
  onChange: (url: string) => void
  shape?: 'square' | 'banner'
  hint?: string
}) {
  const { pageId } = useEditorState()
  return (
    <ImageUploadField
      label={label}
      currentUrl={url || null}
      shape={shape}
      hint={hint ?? 'JPG ou PNG, até 5 MB. Ideal: 1600 px de largura.'}
      onUpload={(file) => uploadPaginaImage(file, pageId)}
      onUploaded={onChange}
      onRemove={url ? () => onChange('') : undefined}
    />
  )
}

/** Ícone ou imagem (o bloco decide se "nenhum" é uma opção). */
export function MediaField({
  media,
  onChange,
  allowNone = false,
}: {
  media: MediaRef
  onChange: (media: MediaRef) => void
  allowNone?: boolean
}) {
  const kinds = [
    ...(allowNone ? [{ value: 'none' as const, label: 'Nenhum' }] : []),
    { value: 'icon' as const, label: 'Ícone' },
    { value: 'image' as const, label: 'Imagem' },
  ]
  return (
    <div className="flex flex-col gap-3">
      <OptionGroup label="Mostrar" value={media.kind} options={kinds} onChange={(kind) => onChange({ ...media, kind })} />
      {media.kind === 'icon' && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm leading-none font-medium">Ícone</legend>
          <div role="radiogroup" aria-label="Ícone" className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 lg:grid-cols-10">
            {PAGE_ICONS.map(({ key, label, icon: Icon }) => {
              const active = media.icon === key
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={label}
                  title={label}
                  onClick={() => onChange({ ...media, icon: key })}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-xl border transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    active ? 'border-primary bg-accent text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" />
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
      {media.kind === 'image' && (
        <>
          <PageImageField label="Imagem" url={media.imageUrl} shape="square" onChange={(imageUrl) => onChange({ ...media, imageUrl })} />
          <Field label="Descrição da imagem" hint="Lida por quem usa leitor de tela. Ex.: Vendedora atendendo na loja.">
            <Input value={media.alt} maxLength={200} onChange={(e) => onChange({ ...media, alt: e.target.value })} />
          </Field>
        </>
      )}
    </div>
  )
}

const MODE_OPTIONS: { value: LinkMode; label: string }[] = [
  { value: 'none', label: 'Escolha…' },
  { value: 'page', label: 'Uma página do site' },
  { value: 'url', label: 'Endereço da internet' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Telefone' },
]

/** Destino de um botão: página do site, endereço, WhatsApp ou telefone. */
export function LinkField({
  link,
  onChange,
  showProblem,
}: {
  link: LinkValue
  onChange: (link: LinkValue) => void
  /** Mostra o aviso quando o destino não funciona (use quando o botão já tem texto) */
  showProblem: boolean
}) {
  const { linkTargets } = useEditorState()
  const id = React.useId()
  const problem = showProblem ? linkProblem(link) : null
  const resolved = resolveLink(link)
  const known = linkTargets.some((t) => t.path === link.value)

  return (
    <div className="flex flex-col gap-3">
      <Field label="Para onde leva" htmlFor={`${id}-modo`}>
        <NativeSelect
          id={`${id}-modo`}
          value={link.mode}
          onChange={(e) => onChange({ ...link, mode: e.target.value as LinkMode, value: '', message: '', newTab: false })}
        >
          {MODE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      </Field>

      {link.mode === 'page' && (
        <Field label="Página" htmlFor={`${id}-pagina`}>
          <NativeSelect id={`${id}-pagina`} value={link.value} onChange={(e) => onChange({ ...link, value: e.target.value })}>
            <option value="">Escolha a página…</option>
            {link.value && !known && <option value={link.value}>{link.value}</option>}
            {linkTargets.map((t) => (
              <option key={t.path} value={t.path}>
                {t.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}

      {link.mode === 'url' && (
        <>
          <Field label="Endereço" htmlFor={`${id}-url`} hint="Exemplos: https://www.exemplo.com.br ou /explorar">
            <Input
              id={`${id}-url`}
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={500}
              value={link.value}
              onChange={(e) => onChange({ ...link, value: e.target.value })}
            />
          </Field>
          <CheckField label="Abrir em outra aba" checked={link.newTab} onChange={(newTab) => onChange({ ...link, newTab })} />
        </>
      )}

      {link.mode === 'whatsapp' && (
        <>
          <Field label="Número com DDD" htmlFor={`${id}-zap`}>
            <Input
              id={`${id}-zap`}
              inputMode="tel"
              placeholder="(82) 99999-9999"
              value={maskPhone(link.value)}
              onChange={(e) => onChange({ ...link, value: maskPhone(e.target.value) })}
            />
          </Field>
          <Field label="Mensagem já escrita (opcional)" htmlFor={`${id}-msg`}>
            <Input id={`${id}-msg`} maxLength={300} value={link.message} onChange={(e) => onChange({ ...link, message: e.target.value })} />
          </Field>
        </>
      )}

      {link.mode === 'phone' && (
        <Field label="Telefone com DDD" htmlFor={`${id}-tel`}>
          <Input
            id={`${id}-tel`}
            inputMode="tel"
            placeholder="(82) 3621-0000"
            value={maskPhone(link.value)}
            onChange={(e) => onChange({ ...link, value: maskPhone(e.target.value) })}
          />
        </Field>
      )}

      {problem && (
        <p role="alert" className="text-sm text-destructive-ink">
          {problem}
        </p>
      )}
      {!problem && resolved && link.mode !== 'page' && (
        <p className="text-xs break-all text-muted-foreground">Vai para: {resolved.href}</p>
      )}
    </div>
  )
}
