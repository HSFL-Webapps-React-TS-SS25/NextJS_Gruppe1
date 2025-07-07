"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/shadcn/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/shadcn/card"
import { Input } from "../../components/ui/shadcn/input"
import { Textarea } from "../../components/ui/shadcn/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/shadcn/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTodos } from "../../hooks/ToDo/useTodos"
import { useFolders } from "../../hooks/useFolders"
import { useIntl, FormattedMessage } from "react-intl"

export default function AddTodoPage() {
    const intl = useIntl()
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedFolderId = searchParams.get("folderId")
    const returnView = searchParams.get("returnView") || "list"

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(preselectedFolderId)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { addTodo, isPendingAdd } = useTodos()
    const { folders } = useFolders()

    const getBackUrl = () => {
        return returnView === "board" ? "/?view=board" : "/?view=list"
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            setError(intl.formatMessage({ id: "todo.form.error.titleRequired" }))
            return
        }

        try {
            setIsSubmitting(true)
            await addTodo({
                title: title.trim(),
                description: description.trim(),
                folderId: selectedFolderId,
            })

            // Navigiere zurück zur ursprünglichen Ansicht
            router.push(getBackUrl())
            router.refresh() // Erzwinge eine Aktualisierung der Daten
        } catch (error) {
            console.error("Fehler beim Erstellen der Aufgabe:", error)
            setError("Fehler beim Erstellen der Aufgabe")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Link href={getBackUrl()} className="flex items-center text-purple-700 mb-4 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <FormattedMessage id="todo.navigation.backToList" />
            </Link>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-purple-700">
                        <FormattedMessage id="todo.add.title" />
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="pt-6 space-y-4">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">
                                <FormattedMessage id="todo.form.title.label" />
                                <span className="text-red-500"> *</span>
                            </label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={intl.formatMessage({ id: "todo.form.title.placeholder" })}
                                className="w-full"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                <FormattedMessage id="todo.form.description.label" />
                            </label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={intl.formatMessage({ id: "todo.form.description.placeholder" })}
                                className="w-full"
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="folder" className="text-sm font-medium">
                                <FormattedMessage id="folder.title" />
                            </label>
                            <Select
                                value={selectedFolderId || "none"}
                                onValueChange={(value) => setSelectedFolderId(value === "none" ? null : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={intl.formatMessage({ id: "folder.select.placeholder" })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <FormattedMessage id="folder.unassigned" />
                                    </SelectItem>
                                    {folders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: folder.color }} />
                                                {folder.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 mt-4">
                        <Link href={getBackUrl()}>
                            <Button type="button" variant="outline" className="bg-white hover:bg-gray-100">
                                <FormattedMessage id="todo.form.cancel" />
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isPendingAdd || isSubmitting} className="bg-purple-700 hover:bg-purple-800">
                            {isPendingAdd || isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <FormattedMessage id="todo.form.saving" />
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    <FormattedMessage id="todo.form.save" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
