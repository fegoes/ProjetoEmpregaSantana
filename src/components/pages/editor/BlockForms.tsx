import { Plus, Trash2 } from 'lucide-react'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckField, Field, LinkField, MediaField, OptionGroup, PageImageField } from '@/components/pages/editor/fields'
import {
  MAX_BUTTONS,
  MAX_ITEMS,
  newButton,
  newIconItem,
  type Block,
  type ButtonItem,
  type ButtonVariant,
  type IconItem,
} from '@/lib/pageLayout'

const VARIANT_OPTIONS: { value: ButtonVariant; label: string }[] = [
  { value: 'cta', label: 'Laranja (destaque)' },
  { value: 'solid', label: 'Azul' },
  { value: 'outline', label: 'Só contorno' },
]

function ButtonsEditor({ items, onChange }: { items: ButtonItem[]; onChange: (items: ButtonItem[]) => void }) {
  const update = (id: string, patch: Partial<ButtonItem>) => onChange(items.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y border-y">
        {items.map((item, i) => (
          <li key={item.id} className="flex flex-col gap-3 py-3">
            <div className="flex items-end gap-2">
              <Field label={`Texto do botão ${i + 1}`} className="min-w-0 flex-1">
                <Input value={item.label} maxLength={60} onChange={(e) => update(item.id, { label: e.target.value })} />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive-ink"
                aria-label={`Apagar o botão ${i + 1}`}
                onClick={() => onChange(items.filter((b) => b.id !== item.id))}
              >
                <Trash2 />
              </Button>
            </div>
            <OptionGroup label="Estilo" value={item.variant} options={VARIANT_OPTIONS} onChange={(variant) => update(item.id, { variant })} />
            <LinkField link={item.link} showProblem={item.label.trim().length > 0} onChange={(link) => update(item.id, { link })} />
          </li>
        ))}
      </ul>
      {items.length < MAX_BUTTONS && (
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => onChange([...items, newButton()])}>
          <Plus /> Adicionar botão
        </Button>
      )}
    </div>
  )
}

function IconItemsEditor({ items, onChange }: { items: IconItem[]; onChange: (items: IconItem[]) => void }) {
  const update = (id: string, patch: Partial<IconItem>) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y border-y">
        {items.map((item, i) => (
          <li key={item.id} className="flex flex-col gap-3 py-3">
            <div className="flex items-end gap-2">
              <Field label={`Título do item ${i + 1}`} className="min-w-0 flex-1">
                <Input value={item.title} maxLength={120} onChange={(e) => update(item.id, { title: e.target.value })} />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive-ink"
                aria-label={`Apagar o item ${i + 1}`}
                onClick={() => onChange(items.filter((it) => it.id !== item.id))}
              >
                <Trash2 />
              </Button>
            </div>
            <Field label="Texto">
              <Textarea rows={2} maxLength={400} value={item.text} onChange={(e) => update(item.id, { text: e.target.value })} />
            </Field>
            <MediaField media={item.media} onChange={(media) => update(item.id, { media })} />
          </li>
        ))}
      </ul>
      {items.length < MAX_ITEMS && (
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => onChange([...items, newIconItem()])}>
          <Plus /> Adicionar item
        </Button>
      )}
    </div>
  )
}

/** Campos de um bloco, conforme o tipo. */
export function BlockForm({ block, onChange }: { block: Block; onChange: (block: Block) => void }) {
  switch (block.type) {
    case 'heading':
      return (
        <>
          <Field label="Título">
            <Input value={block.title} maxLength={200} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </Field>
          <Field label="Frase de apoio (opcional)">
            <Textarea rows={2} maxLength={400} value={block.subtitle} onChange={(e) => onChange({ ...block, subtitle: e.target.value })} />
          </Field>
          <OptionGroup
            label="Tamanho do título"
            value={block.size}
            options={[
              { value: 'md', label: 'Médio' },
              { value: 'lg', label: 'Grande' },
              { value: 'xl', label: 'Enorme' },
            ]}
            onChange={(size) => onChange({ ...block, size })}
          />
        </>
      )

    case 'text':
      return (
        <>
          <RichTextEditor value={block.html} onChange={(html) => onChange({ ...block, html })} placeholder="Escreva o texto aqui…" />
          <OptionGroup
            label="Tamanho da letra"
            value={block.size}
            options={[
              { value: 'sm', label: 'Pequena' },
              { value: 'md', label: 'Média' },
              { value: 'lg', label: 'Grande' },
            ]}
            onChange={(size) => onChange({ ...block, size })}
          />
        </>
      )

    case 'image':
      return (
        <>
          <PageImageField label="Imagem" url={block.imageUrl} onChange={(imageUrl) => onChange({ ...block, imageUrl })} />
          <Field label="Descrição da imagem" hint="Lida por quem usa leitor de tela. Ex.: Fachada da loja na Rua Nova.">
            <Input value={block.alt} maxLength={200} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
          </Field>
          <OptionGroup
            label="Tamanho"
            value={block.size}
            options={[
              { value: 'sm', label: 'Pequena' },
              { value: 'md', label: 'Média' },
              { value: 'lg', label: 'Grande' },
              { value: 'full', label: 'Largura toda' },
            ]}
            onChange={(size) => onChange({ ...block, size })}
          />
          <CheckField label="Cantos arredondados" checked={block.rounded} onChange={(rounded) => onChange({ ...block, rounded })} />
        </>
      )

    case 'buttons':
      return <ButtonsEditor items={block.items} onChange={(items) => onChange({ ...block, items })} />

    case 'media_text':
      return (
        <>
          <Field label="Título">
            <Input value={block.title} maxLength={200} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          </Field>
          <RichTextEditor value={block.html} onChange={(html) => onChange({ ...block, html })} placeholder="Escreva o texto aqui…" />
          <MediaField media={block.media} allowNone onChange={(media) => onChange({ ...block, media })} />
          {block.media.kind !== 'none' && (
            <>
              <OptionGroup
                label="Lado da imagem ou ícone"
                value={block.side}
                options={[
                  { value: 'left', label: 'Esquerda' },
                  { value: 'right', label: 'Direita' },
                ]}
                onChange={(side) => onChange({ ...block, side })}
              />
              <OptionGroup
                label="Tamanho da imagem ou ícone"
                value={block.mediaSize}
                options={[
                  { value: 'sm', label: 'Pequeno' },
                  { value: 'md', label: 'Médio' },
                  { value: 'lg', label: 'Grande' },
                ]}
                onChange={(mediaSize) => onChange({ ...block, mediaSize })}
              />
            </>
          )}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Botões (opcional)</p>
            <ButtonsEditor items={block.buttons} onChange={(buttons) => onChange({ ...block, buttons })} />
          </div>
        </>
      )

    case 'icon_list':
      return (
        <>
          <OptionGroup
            label="Itens por linha"
            value={block.columns}
            options={[
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
            ]}
            onChange={(columns) => onChange({ ...block, columns })}
            hint="No celular os itens ficam um embaixo do outro."
          />
          <IconItemsEditor items={block.items} onChange={(items) => onChange({ ...block, items })} />
        </>
      )

    case 'search':
      return (
        <>
          <Field label="Texto dentro do campo">
            <Input value={block.placeholder} maxLength={80} onChange={(e) => onChange({ ...block, placeholder: e.target.value })} />
          </Field>
          <Field label="Texto do botão">
            <Input value={block.buttonLabel} maxLength={30} onChange={(e) => onChange({ ...block, buttonLabel: e.target.value })} />
          </Field>
          <p className="text-sm text-muted-foreground">Quem buscar é levado à página Explorar com o resultado.</p>
        </>
      )

    case 'feed':
      return (
        <p className="text-sm text-muted-foreground">
          Mostra a lista de vagas e profissionais do site, com as abas e os filtros. Não há nada para configurar aqui: use a aba Aparência da seção
          para escolher a largura.
        </p>
      )
  }
}
