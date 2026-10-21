import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { DEFAULT_APPEARANCE, useAppearance, type Appearance } from '@/hooks/useAppearance'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function AparenciaPage() {
  const query = useAppearance()
  const client = useQueryClient()
  const [form, setForm] = useState<Appearance>(DEFAULT_APPEARANCE)
  const [saved, setSaved] = useState(false)
  useEffect(() => { if (query.data) setForm(query.data) }, [query.data])
  const save = useMutation({ mutationFn: async () => {
    const { data, error } = await supabase.from('site_appearance').upsert({ id: true, ...form }).select().single()
    if (error) throw error
    return data
  }, onSuccess: data => { client.setQueryData(['appearance'], data); setSaved(true) } })
  function submit(e: FormEvent) { e.preventDefault(); setSaved(false); save.mutate() }
  const control = 'min-h-11 w-full rounded-lg border bg-card px-3 text-sm'
  return <div className="max-w-5xl space-y-7"><div><h1 className="text-2xl font-extrabold">Aparência</h1><p className="mt-3 text-sm text-muted-foreground">Personalize o site e o sistema com as opções da identidade do EmpregaSantana.</p></div>
    {query.isLoading && <p role="status">Carregando preferências…</p>}
    {query.isError && <div role="alert" className="rounded-xl border p-5"><p>Não foi possível carregar a configuração. Confira a conexão e se a atualização 0022 do banco foi aplicada.</p><Button variant="outline" className="mt-3" onClick={() => query.refetch()}>Tentar novamente</Button></div>}
    {!query.isLoading && !query.isError && <form onSubmit={submit} className="grid gap-7 xl:grid-cols-2"><section className="space-y-6 rounded-xl border bg-card p-5 sm:p-7"><h2 className="text-lg font-bold">Preferências do site e sistema</h2>
      <div className="space-y-2"><Label htmlFor="appearance-primary">Azul principal</Label><select id="appearance-primary" className={control} disabled={save.isPending} value={form.primary_color} onChange={e => { setSaved(false); setForm({ ...form, primary_color: e.target.value as Appearance['primary_color'] }) }}><option value="#1E63B6">Azul da marca</option><option value="#16529A">Azul intenso</option><option value="#0D3A66">Azul profundo</option></select></div>
      <div className="space-y-2"><Label htmlFor="appearance-background">Fundo do conteúdo</Label><select id="appearance-background" className={control} disabled={save.isPending} value={form.background} onChange={e => { setSaved(false); setForm({ ...form, background: e.target.value as Appearance['background'] }) }}><option value="soft">Cinza claro</option><option value="white">Branco</option></select></div>
      <div className="space-y-2"><Label htmlFor="appearance-font">Tamanho do texto</Label><select id="appearance-font" className={control} disabled={save.isPending} value={form.font_scale} onChange={e => { setSaved(false); setForm({ ...form, font_scale: e.target.value as Appearance['font_scale'] }) }}><option value="normal">Padrão</option><option value="comfortable">Ampliado</option></select></div>
      <div className="space-y-2"><Label htmlFor="appearance-buttons">Formato dos botões</Label><select id="appearance-buttons" className={control} disabled={save.isPending} value={form.button_shape} onChange={e => { setSaved(false); setForm({ ...form, button_shape: e.target.value as Appearance['button_shape'] }) }}><option value="pill">Cápsula</option><option value="rounded">Cantos arredondados</option></select></div>
      <p className="text-sm leading-relaxed text-muted-foreground">O conteúdo permanece em modo claro, com navegação lateral azul escura. As preferências salvas valem para todos os visitantes e usuários.</p>
      {save.isError && <p role="alert" className="text-sm text-destructive">Não foi possível salvar. Suas escolhas foram preservadas; tente novamente.</p>}{saved && <p role="status" className="text-sm text-primary">Aparência salva e aplicada ao sistema.</p>}
      <div className="flex flex-wrap gap-3"><Button variant="cta" disabled={save.isPending}> {save.isPending ? 'Salvando…' : 'Salvar aparência'}</Button><Button type="button" variant="outline" disabled={save.isPending} onClick={() => { setSaved(false); setForm(DEFAULT_APPEARANCE) }}>Restaurar campos padrão</Button></div>
    </section><section aria-label="Prévia das escolhas, ainda não salvas" className="self-start rounded-xl border p-5 sm:p-7" style={{ background: form.background === 'white' ? '#FFF' : '#F8F8F8' }}><h2 className="text-lg font-bold">Prévia</h2><p className="mt-3 text-sm text-muted-foreground">Estas escolhas só entram em vigor depois de salvar.</p><div className="mt-6 grid min-h-56 grid-cols-[72px_minmax(0,1fr)] overflow-hidden rounded-xl border" style={{ fontSize: form.font_scale === 'comfortable' ? '17px' : '16px' }}><div className="bg-brand-ink p-3 text-white"><span className="block h-2 rounded bg-white/70" /><span className="mt-5 block h-2 rounded bg-white/30" /><span className="mt-3 block h-2 rounded bg-white/30" /></div><div className="min-w-0 p-4"><h3 className="font-semibold" style={{ color: form.primary_color }}>Seu próximo passo</h3><p className="mt-4" style={{ fontSize: '0.875em' }}>Encontre oportunidades na sua região.</p><span className="mt-6 inline-block px-4 py-3 font-semibold text-white" style={{ fontSize: '0.875em', background: form.primary_color, borderRadius: form.button_shape === 'pill' ? '9999px' : '12px' }}>Ação de exemplo</span></div></div></section></form>}
  </div>
}
