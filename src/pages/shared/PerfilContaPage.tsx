import * as React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function PerfilContaPage() {
  const { profile, refreshProfile, updatePassword } = useAuth()
  const [fullName, setFullName] = React.useState(profile?.full_name ?? '')
  const [phone, setPhone] = React.useState(profile?.phone ?? '')
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState('')
  const [saved, setSaved] = React.useState(false)

  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [passwordSaving, setPasswordSaving] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = React.useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile.id).select('id').single()
      if (error) throw error
      await refreshProfile()
      setSaved(true)
    } catch { setSaveError('Não foi possível salvar sua conta. Tente novamente.') } finally { setSaving(false) }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSaved(false)
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }
    setPasswordSaving(true)
    const { error } = await updatePassword(newPassword)
    setPasswordSaving(false)
    if (error) {
      setPasswordError(error)
      return
    }
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSaved(true)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <Card>
        <CardHeader>
          <h1 className="font-display text-xl font-semibold">Configurações de conta</h1>
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
            {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
            {saved && <p className="text-sm text-muted-foreground">Alterações salvas.</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-base font-semibold">Alterar senha</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                minLength={6}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <Button type="submit" variant="outline" disabled={passwordSaving}>
              {passwordSaving ? 'Salvando…' : 'Alterar senha'}
            </Button>
            {passwordSaved && <p className="text-sm text-muted-foreground">Senha alterada.</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
