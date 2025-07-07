"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { FormattedMessage } from "react-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs"
import { LayoutGrid, List } from "lucide-react"
import TodoContainer from "@/components/ToDo/todo-container"
import FolderBoard from "@/components/Folder/folder-board"
import LanguageSelector from "@/components/language-selector"
import { ThemeSwitcher } from "@/components/ui/Theme/theme-switcher"

export default function Home() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeView, setActiveView] = useState<"list" | "board">("list")

    // Lade die Ansicht aus der URL oder verwende Standard
    useEffect(() => {
        const viewFromUrl = searchParams.get("view")
        if (viewFromUrl === "board" || viewFromUrl === "list") {
            setActiveView(viewFromUrl)
        }
    }, [searchParams])

    // Aktualisiere die URL wenn sich die Ansicht ändert
    const handleViewChange = (value: string) => {
        const newView = value as "list" | "board"
        setActiveView(newView)
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.set("view", newView)
        router.replace(`/?${newSearchParams.toString()}`, { scroll: false })
    }

    return (
        <main className="container mx-auto py-4 px-4 sm:py-8 max-w-7xl">
            {/* Mobile-optimierter Header */}
            <div className="flex flex-col space-y-4 mb-6 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-400 text-center sm:text-left">
                    <FormattedMessage id="app.title" />
                </h1>

                {/* Mobile: Stacked Layout, Desktop: Side by side */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                    <Tabs value={activeView} onValueChange={handleViewChange}>
                        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                            <TabsTrigger value="list" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                <List className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Liste</span>
                                <span className="sm:hidden">📋</span>
                            </TabsTrigger>
                            <TabsTrigger value="board" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Board</span>
                                <span className="sm:hidden">📊</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                        <LanguageSelector />
                        <ThemeSwitcher />
                    </div>
                </div>
            </div>

            <Tabs value={activeView} onValueChange={handleViewChange}>
                <TabsContent value="list" className="mt-0">
                    <TodoContainer currentView="list" />
                </TabsContent>
                <TabsContent value="board" className="mt-0">
                    <FolderBoard currentView="board" />
                </TabsContent>
            </Tabs>
        </main>
    )
}
