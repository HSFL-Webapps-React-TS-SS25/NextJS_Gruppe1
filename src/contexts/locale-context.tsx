"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { IntlProvider } from "react-intl"

// Sprachdateien importieren
import deMessages from "../lang/de.json"
import enMessages from "../lang/en.json"

// Verfügbare Sprachen definieren
export type Locale = "de" | "en"

interface LocaleContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    availableLocales: { code: Locale; name: string; flag: string }[]
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Nachrichten für jede Sprache
const messages = {
    de: deMessages,
    en: enMessages,
}

// Verfügbare Sprachen mit Flaggen
const availableLocales = [
    { code: "de" as Locale, name: "Deutsch", flag: "🇩🇪" },
    { code: "en" as Locale, name: "English", flag: "🇺🇸" },
]

interface LocaleProviderProps {
    children: React.ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
    const [locale, setLocaleState] = useState<Locale>("de")

    // Sprache aus localStorage laden
    useEffect(() => {
        const savedLocale = localStorage.getItem("locale") as Locale
        if (savedLocale && (savedLocale === "de" || savedLocale === "en")) {
            setLocaleState(savedLocale)
        }
    }, [])

    // Sprache setzen und in localStorage speichern
    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem("locale", newLocale)
    }

    const contextValue: LocaleContextType = {
        locale,
        setLocale,
        availableLocales,
    }

    return (
        <LocaleContext.Provider value={contextValue}>
            <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="de">
                {children}
            </IntlProvider>
        </LocaleContext.Provider>
    )
}

// Hook zum Verwenden des LocaleContext
export function useLocale() {
    const context = useContext(LocaleContext)
    if (context === undefined) {
        throw new Error("useLocale must be used within a LocaleProvider")
    }
    return context
}
