import { getCurrentTeam, getSession } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Crown, Shield, User } from 'lucide-react'

const roleLabels: Record<string, string> = {
  OWNER: 'Inhaber',
  ADMIN: 'Admin',
  MEMBER: 'Mitglied',
}

const roleIcons: Record<string, typeof Crown> = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
}

export default async function TeamPage() {
  const session = await getSession()
  const team = await getCurrentTeam()

  if (!team) {
    return <div>Team nicht gefunden</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground">Verwalte dein Team und Mitglieder</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription>Team-ID: {team.slug}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {team.members.map((member) => {
              const RoleIcon = roleIcons[member.role]
              const initials = member.user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U'

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <RoleIcon className="h-3 w-3" />
                    {roleLabels[member.role]}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team-Mitglieder einladen</CardTitle>
          <CardDescription>
            Lade neue Mitglieder per E-Mail ein
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Diese Funktion ist in der aktuellen Version noch nicht verfuegbar.
            Kontaktiere den Support fuer Team-Einladungen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
