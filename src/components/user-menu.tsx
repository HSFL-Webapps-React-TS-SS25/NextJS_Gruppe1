"use client"

import { useSession, signOut } from "../lib/auth-client"
import { Button } from "./ui/shadcn/button"
import { FormattedMessage } from "react-intl"
import { User, LogOut } from "lucide-react"

export default function UserMenu() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
  }

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="w-4 h-4" />
        <span className="font-medium">{session.user.name || session.user.email}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
        <LogOut className="w-4 h-4 mr-2" />
        <FormattedMessage id="auth.logout" defaultMessage="Abmelden" />
      </Button>
    </div>
  )
} 