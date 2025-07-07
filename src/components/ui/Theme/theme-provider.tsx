"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // Verwende einen State, um zu prüfen, ob wir auf dem Client sind
    const [mounted, setMounted] = useState(false)

    // Setze mounted auf true, sobald die Komponente auf dem Client montiert ist
    useEffect(() => {
        setMounted(true)
    }, [])

    // Rendere die Provider nur auf dem Client
    // Dies verhindert Hydration-Fehler, da das Theme erst auf dem Client angewendet wird
    if (!mounted) {
        return <>{children}</>
    }

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}