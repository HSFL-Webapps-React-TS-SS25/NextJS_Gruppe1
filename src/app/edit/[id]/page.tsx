"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../../components/ui/shadcn/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/shadcn/card"
import { Input } from "../../../components/ui/shadcn/input"
import { Textarea } from "../../../components/ui/shadcn/textarea"
import { Checkbox } from "../../../components/ui/shadcn/checkbox"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Todo } from "../../actions/todo-actions"
import { use } from "react"
import { useTodo } from "../../../hooks/ToDo/useTodo"
import { useIntl, FormattedMessage } from "react-intl"

export default function EditTodoPage({ params }: { params: Promise<{ id: string }> }) {
    const intl = useIntl()
    const router = useRouter()
    const searchParams = useSearchParams()
    const resolvedParams = use(params)
    const id = resolvedParams.id

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Hole die returnView aus den URL-Parametern
    const returnView = searchParams.get("returnView") || "list"

    // Verwende den useTodo Hook
    const { todo, isLoading, isError, updateTodo, isPendingUpdate } = useTodo(id)

    // Formular-Felder initialisieren, wenn das Todo geladen ist
    useEffect(() => {
        if (todo) {
            setTitle(todo.title)
            setDescription(todo.description)
            setCompleted(todo.completed)
        }
    }, [todo])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            setError(intl.formatMessage({ id: "todo.form.error.titleRequired" }))
            return
        }

        if (todo && !isSubmitting) {
            setIsSubmitting(true)
            setError(null)

            try {
                const updatedTodo: Todo = {
                    ...todo,
                    title,
                    description,
                    completed,
                    completedAt: completed && !todo.completed ? new Date() : todo.completedAt,
                }

                // Warte auf das Update
                await updateTodo(updatedTodo)

                // Kleine Verzögerung um sicherzustellen, dass das Update abgeschlossen ist
                setTimeout(() => {
                    // Navigiere zurück zur ursprünglichen Ansicht
                    if (returnView === "board") {
                        router.replace("/?view=board")
                    } else if (returnView === "list") {
                        router.replace("/?view=list")
                    } else {
                        // Fallback zur Details-Seite
                        router.replace(`/details/${id}`)
                    }
                }, 100)
            } catch (error) {
                console.error("Fehler beim Aktualisieren des Todos:", error)
                setError("Fehler beim Speichern der Aufgabe")
                setIsSubmitting(false)
            }
        }
    }

    const getBackLink = () => {
        if (returnView === "board") {
            return "/?view=board"
        } else if (returnView === "list") {
            return "/?view=list"
        } else {
            return `/details/${id}`
        }
    }

    const getBackLinkText = () => {
        if (returnView === "board") {
            return "Zurück zur Board-Ansicht"
        } else if (returnView === "list") {
            return intl.formatMessage({ id: "todo.navigation.backToList" })
        } else {
            return intl.formatMessage({ id: "todo.navigation.backToDetails" })
        }
    }

    // Lade-Zustand anzeigen
    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
                <span className="ml-2 text-lg">
          <FormattedMessage id="todo.loading" />
        </span>
            </div>
        )
    }

    // Fehler-Zustand anzeigen
    if (isError || !todo) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Link
                    href={getBackLink()}
                    className="flex items-center text-purple-700 dark:text-purple-400 mb-4 hover:underline"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {getBackLinkText()}
                </Link>
                <div
                    className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
                    role="alert"
                >
                    <strong className="font-bold">
                        <FormattedMessage id="todo.error.title" />
                    </strong>
                    <span className="block sm:inline">
            {" "}
                        <FormattedMessage id="todo.error.notFound" />
          </span>
                </div>
            </div>
        )
    }

    const isButtonDisabled = isPendingUpdate || isSubmitting

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Link
                href={getBackLink()}
                className="flex items-center text-purple-700 dark:text-purple-400 mb-4 hover:underline"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {getBackLinkText()}
            </Link>

            <Card className="shadow-lg">
                <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                    <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">
                        <FormattedMessage id="todo.edit.title" />
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="pt-6 space-y-4">
                        {error && (
                            <div
                                className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
                                role="alert"
                            >
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                disabled={isButtonDisabled}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FormattedMessage id="todo.form.description.label" />
                            </label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={intl.formatMessage({ id: "todo.form.description.placeholder" })}
                                className="w-full"
                                rows={5}
                                disabled={isButtonDisabled}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="completed"
                                checked={completed}
                                onCheckedChange={(checked) => setCompleted(checked === true)}
                                disabled={isButtonDisabled}
                            />
                            <label
                                htmlFor="completed"
                                className="text-sm font-medium leading-none cursor-pointer text-gray-700 dark:text-gray-300"
                            >
                                <FormattedMessage id="todo.form.completed.label" />
                            </label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 bg-gray-50 dark:bg-gray-800 mt-4">
                        <Link href={getBackLink()}>
                            <Button
                                type="button"
                                variant="outline"
                                className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                disabled={isButtonDisabled}
                            >
                                <FormattedMessage id="todo.form.cancel" />
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isButtonDisabled}
                            className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700"
                        >
                            {isButtonDisabled ? (
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
