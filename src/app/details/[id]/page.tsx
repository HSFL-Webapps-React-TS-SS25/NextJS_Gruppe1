"use client"

import { Button } from "../../../components/ui/shadcn/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/shadcn/card"
import { Badge } from "../../../components/ui/shadcn/badge"
import { ArrowLeft, Edit, Trash, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { de, enUS } from "date-fns/locale"
import { use } from "react"
import { useTodo } from "../../../hooks/ToDo/useTodo"
import { deleteTodo } from "../../../app/actions/todo-actions"
import { useIntl, FormattedMessage } from "react-intl"
import { useLocale } from "../../../contexts/locale-context"


export default function TodoDetails({ params }: { params: Promise<{ id: string }> }) {
    const intl = useIntl()
    const { locale } = useLocale()
    const router = useRouter()
    const resolvedParams = use(params)
    const id = resolvedParams.id

    // Verwende den useTodo Hook
    const { todo, isLoading, isError } = useTodo(id)

    // Löschen-Funktion
    const handleDelete = async () => {
        const confirmMessage = intl.formatMessage({ id: "todo.delete.confirm" })
        if (confirm(confirmMessage)) {
            await deleteTodo(id)
            router.push("/")
        }
    }

    // Locale für date-fns bestimmen
    const dateLocale = locale === "en" ? enUS : de

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
                <Link href="/" className="flex items-center text-purple-700 mb-4 hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <FormattedMessage id="todo.navigation.backToList" />
                </Link>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
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

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Link href="/" className="flex items-center text-purple-700 mb-4 hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <FormattedMessage id="todo.navigation.backToList" />
            </Link>

            <Card className="shadow-lg">
                <CardHeader className="bg-purple-50">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl text-purple-700">{todo.title}</CardTitle>
                        <Badge className={todo.completed ? "bg-green-500" : "bg-yellow-500"}>
                            <FormattedMessage id={todo.completed ? "todo.status.completed" : "todo.status.open"} />
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="prose">
                        <p className="whitespace-pre-wrap">{todo.description}</p>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                            <p className="font-semibold">
                                <FormattedMessage id="todo.details.createdAt" />
                            </p>
                            <p>{format(new Date(todo.createdAt), "PPP", { locale: dateLocale })}</p>
                        </div>
                        {todo.completed && todo.completedAt && (
                            <div>
                                <p className="font-semibold">
                                    <FormattedMessage id="todo.details.completedAt" />
                                </p>
                                <p>{format(new Date(todo.completedAt), "PPP", { locale: dateLocale })}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-gray-50 mt-4">
                    <Link href={`/edit/${todo.id}`}>
                        <Button variant="outline" className="bg-white hover:bg-gray-100">
                            <Edit className="mr-2 h-4 w-4" />
                            <FormattedMessage id="todo.actions.edit" />
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash className="mr-2 h-4 w-4" />
                        <FormattedMessage id="todo.actions.delete" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
