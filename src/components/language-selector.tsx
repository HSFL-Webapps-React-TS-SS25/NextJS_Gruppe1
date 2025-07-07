"use client"

import { useLocale } from "../contexts/locale-context"
import { Button } from "./ui/shadcn/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/shadcn/dropdown-menu"
import { Globe } from "lucide-react"

export default function LanguageSelector() {
    const { locale, setLocale, availableLocales } = useLocale()

    const currentLocale = availableLocales.find((l) => l.code === locale)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Globe className="mr-2 h-4 w-4" />
                    {currentLocale?.flag} {currentLocale?.name}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {availableLocales.map((localeOption) => (
                    <DropdownMenuItem
                        key={localeOption.code}
                        onClick={() => setLocale(localeOption.code)}
                        className={locale === localeOption.code ? "bg-accent" : ""}
                    >
                        <span className="mr-2">{localeOption.flag}</span>
                        {localeOption.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
