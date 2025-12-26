'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Bell, Shield, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [name, setName] = useState(session?.user?.name || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateProfile = async () => {
    setIsLoading(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        throw new Error('Update fehlgeschlagen')
      }

      await update({ name })

      toast({
        title: 'Profil aktualisiert',
        description: 'Deine Aenderungen wurden gespeichert.',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Profil konnte nicht aktualisiert werden.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalte dein Konto und Einstellungen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil
          </CardTitle>
          <CardDescription>Deine persoenlichen Informationen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              value={session?.user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              E-Mail-Adresse kann nicht geaendert werden
            </p>
          </div>
          <Button onClick={handleUpdateProfile} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
          <CardDescription>E-Mail-Benachrichtigungen konfigurieren</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Benachrichtigungs-Einstellungen sind in der aktuellen Version noch nicht verfuegbar.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicherheit
          </CardTitle>
          <CardDescription>Passwort und Sicherheitseinstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Passwort aendern</Label>
            <p className="text-sm text-muted-foreground">
              Nutze die "Passwort vergessen" Funktion auf der Login-Seite, um dein Passwort zu aendern.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Gefahrenzone
          </CardTitle>
          <CardDescription>Irreversible Aktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Konto loeschen</p>
              <p className="text-sm text-muted-foreground mb-4">
                Das Loeschen deines Kontos entfernt alle Daten unwiderruflich.
              </p>
              <Button variant="destructive" disabled>
                Konto loeschen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
