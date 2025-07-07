import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/ui/Theme/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { LocaleProvider } from "@/contexts/locale-context"
import { Toaster } from "@/components/ui/shadcn/sonner"
import SessionProvider from "@/components/session-provider"
import UserMenu from "@/components/user-menu"

export const metadata: Metadata = {
    title: "Todo App",
    description: "Eine moderne Todo-Anwendung",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="de" suppressHydrationWarning>
        <body className="min-h-screen bg-background">
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <QueryProvider>
                    <LocaleProvider>
                        <div className="w-full flex justify-end p-4"><UserMenu /></div>
                        {children}
                        <Toaster />
                    </LocaleProvider>
                </QueryProvider>
            </ThemeProvider>
        </SessionProvider>
        </body>
        </html>
    )
}
