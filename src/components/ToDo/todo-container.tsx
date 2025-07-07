"use client"

import { useState } from "react"
import { useFolders } from "../../hooks/useFolders"
import { useTodos } from "../../hooks/ToDo/useTodos"
import { useTodoEnhancements } from "../../hooks/ToDo/use-todo-enhancements"
import { toggleTodoStatus } from "../../app/actions/todo-actions"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "../../hooks/use-sonner"
import TodoListItem from "./todo-list-item"
import { Button } from "../ui/shadcn/button"
import { Plus, Search } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "../ui/shadcn/input"
import type { Todo } from "../../app/actions/todo-actions"
import type { Priority } from "../../hooks/ToDo/use-todo-enhancements"
import { useLocale } from "../../contexts/locale-context"
import DueDateNotification from "../due-date-notification"

interface TodoContainerProps {
    currentView: "list" | "board"
}

export default function TodoContainer({ currentView }: TodoContainerProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const intl = useIntl()
    const router = useRouter()
    const { toast } = useToast()
    const { locale } = useLocale()

    const queryClient = useQueryClient()
    const { folders } = useFolders()
    const { todos, deleteTodo: deleteTodoMutation } = useTodos()
    const { updateTodoEnhancement, getTodoEnhancement, sortTodosByPriority } = useTodoEnhancements()

    // Filtere und sortiere Todos basierend auf Suchbegriff und Priorität
    const filteredTodos = todos.filter(
        (todo) =>
            todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // Sortiere nach Priorität
    const sortedTodos = sortTodosByPriority(filteredTodos)

    const handleToggleTodo = async (id: string) => {
        const todo = todos.find((t) => t.id === id)
        if (todo) {
            try {
                await toggleTodoStatus(todo)
                await queryClient.invalidateQueries({ queryKey: ["todos"] })

                const successMessage = todo.completed
                    ? intl.formatMessage({ id: "notification.todo.reactivated" })
                    : intl.formatMessage({ id: "notification.todo.completed" })

                const description = todo.completed
                    ? intl.formatMessage({ id: "notification.todo.reactivated.description" }, { title: todo.title })
                    : intl.formatMessage({ id: "notification.todo.completed.description" }, { title: todo.title })

                toast.success(successMessage, {
                    description: description,
                })
            } catch (error) {
                console.error("Fehler beim Umschalten des Todo-Status:", error)
                toast.error(intl.formatMessage({ id: "notification.error.update" }), {
                    description: intl.formatMessage({ id: "notification.error.update.description" }),
                })
            }
        }
    }

    const handleDeleteTodo = (id: string) => {
        const todo = todos.find((t) => t.id === id)
        const confirmMessage = intl.formatMessage({ id: "todo.delete.confirm" })
        if (confirm(confirmMessage)) {
            deleteTodoMutation(id)
            if (todo) {
                toast.success(intl.formatMessage({ id: "notification.todo.deleted" }), {
                    description: intl.formatMessage({ id: "notification.todo.deleted.description" }, { title: todo.title }),
                })
            }
        }
    }

    const handleEditTodo = (id: string) => {
        router.push(`/edit/${id}?returnView=${currentView}`)
    }

    const handlePriorityChange = (todoId: string, priority: Priority) => {
        updateTodoEnhancement(todoId, { priority })
        toast.success(intl.formatMessage({ id: "notification.priority.changed" }), {
            description: intl.formatMessage({ id: `priority.${priority}` }),
        })
    }

    const handleDueDateChange = (todoId: string, dueDate: Date | undefined) => {
        updateTodoEnhancement(todoId, { dueDate })
        toast.success(
            dueDate
                ? intl.formatMessage({ id: "notification.dueDate.set" })
                : intl.formatMessage({ id: "notification.dueDate.removed" }),
        )
    }

    // Finde den Ordner für ein Todo
    const getFolderForTodo = (todo: Todo) => {
        if (!todo.folderId) return null
        return folders.find((folder) => folder.id === todo.folderId) || null
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Fälligkeits-Panel */}
            <DueDateNotification todos={todos} />
            {/* Header */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left text-slate-800 dark:text-slate-200">
                    <FormattedMessage id="todo.list.title" />
                </h2>
                <Link href={`/add?returnView=${currentView}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 h-12 sm:h-10">
                        <Plus className="mr-2 h-4 w-4" />
                        <FormattedMessage id="todo.add.title" />
                    </Button>
                </Link>
            </div>

            {/* Suchfeld */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    type="text"
                    placeholder={locale === "en" ? "Search todos..." : "Todos durchsuchen..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                />
            </div>

            {/* Todo Liste */}
            <div className="space-y-3">
                {sortedTodos.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            {searchTerm ? <FormattedMessage id="todo.search.empty" /> : <FormattedMessage id="todo.list.empty" />}
                        </div>
                        {!searchTerm && (
                            <Link href={`/add?returnView=${currentView}`}>
                                <Button variant="outline" className="border-gray-200 dark:border-gray-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    <FormattedMessage id="todo.add.title" />
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    sortedTodos.map((todo) => (
                        <TodoListItem
                            key={todo.id}
                            todo={todo}
                            enhancement={getTodoEnhancement(todo.id)}
                            folder={getFolderForTodo(todo)}
                            onToggle={handleToggleTodo}
                            onDelete={handleDeleteTodo}
                            onEdit={handleEditTodo}
                            onPriorityChange={handlePriorityChange}
                            onDueDateChange={handleDueDateChange}
                        />
                    ))
                )}
            </div>

            {/* Debug-Informationen */}
            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            <FormattedMessage id="debug.overview" />
                        </h4>
                        <div className="space-y-1">
                            <p>
                                <FormattedMessage id="debug.todos" />: <span className="font-medium">{todos.length}</span>
                            </p>
                            <p>
                                <FormattedMessage id="debug.folders" />: <span className="font-medium">{folders.length}</span>
                            </p>
                            {searchTerm && (
                                <p>
                                    Gefiltert: <span className="font-medium">{sortedTodos.length}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
