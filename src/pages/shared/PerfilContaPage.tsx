import * as React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PerfilContaPage() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = React.useState(profile?.full_name ?? '')
  const [phone, setPhone] = React.useState(profile?.phone ?? '')
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSaved(false)
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Configurações de conta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Alterações salvas.</p>}
        </form>
      </CardContent>
    </Card>
  )
}
