"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../ui/shadcn/button"
import { Card, CardContent } from "../ui/shadcn/card"
import { Checkbox } from "../ui/shadcn/checkbox"
import { Badge } from "../ui/shadcn/badge"
import { Eye, Trash } from "lucide-react"
import type { Todo } from "../../app/actions/todo-actions"
import type { Folder } from "../../app/actions/folder-actions"
import { format } from "date-fns"
import { de, enUS } from "date-fns/locale"
import { FormattedMessage } from "react-intl"
import { useLocale } from "../../contexts/locale-context"

interface TodoListProps {
    todos: Todo[]
    folders?: Folder[]
    onToggle: (id: string) => void
    onDelete: (id: string) => void
}

export default function TodoList({
                                     todos,
                                     folders = [],
                                     onToggle,
                                     onDelete,
                                 }: TodoListProps) {
    const { locale } = useLocale()
    const [expandedTodo, setExpandedTodo] = useState<string | null>(null)

    // Locale für date-fns bestimmen
    const dateLocale = locale === "en" ? enUS : de

    const toggleExpand = (id: string) => {
        setExpandedTodo(expandedTodo === id ? null : id)
    }

    // Gruppiere Todos nach Ordnern
    const todosByFolder = folders.length > 0
        ? folders.reduce((acc, folder) => {
            acc[folder.id] = todos.filter((todo) => todo.folderId === folder.id)
            return acc
        }, {} as Record<string, Todo[]>)
        : {}
    // Unzugeordnete Todos
    const unassignedTodos = todos.filter((todo) => !todo.folderId)

    return (
        <div className="space-y-8">
            {/* Ordner-Gruppen */}
            {folders.map((folder) => (
                <div key={folder.id}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: folder.color || "#6b7280" }} />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{folder.name}</span>
                    </div>
                    {todosByFolder[folder.id]?.length ? (
                        todosByFolder[folder.id].map((todo) => (
                            <Card
                                key={todo.id}
                                className={`mb-2 overflow-hidden bg-white dark:bg-gray-900 ${
                                    todo.completed ? "border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-700"
                                }`}
                            >
                                <CardContent className="p-0">
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="pt-1">
                                                <Checkbox
                                                    id={`todo-${todo.id}`}
                                                    checked={todo.completed}
                                                    onCheckedChange={() => onToggle(todo.id)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap justify-between items-start gap-2">
                                                    <h3
                                                        className={`font-medium cursor-pointer ${
                                                            todo.completed
                                                                ? "line-through text-gray-500 dark:text-gray-400"
                                                                : "text-gray-900 dark:text-gray-100"
                                                        }`}
                                                        onClick={() => toggleExpand(todo.id)}
                                                    >
                                                        {todo.title}
                                                    </h3>

                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {/* Kategorie-Anzeige mit Farbe */}
                                                        {folder && (
                                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                                                                <div
                                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: folder.color || "#6b7280" }}
                                                                />
                                                                <span className="text-gray-600 dark:text-gray-400 truncate max-w-20">{folder.name}</span>
                                                            </div>
                                                        )}

                                                        <Badge
                                                            className={
                                                                todo.completed
                                                                    ? "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                                                                    : "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                                                            }
                                                        >
                                                            <FormattedMessage id={todo.completed ? "todo.status.completed" : "todo.status.open"} />
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {expandedTodo === todo.id && (
                                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <p className="whitespace-pre-wrap">{todo.description}</p>
                                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <p>
                                                                <FormattedMessage id="todo.details.createdAt" />{" "}
                                                                {format(new Date(todo.createdAt), "PPP", { locale: dateLocale })}
                                                            </p>
                                                            {todo.completed && todo.completedAt && (
                                                                <p>
                                                                    <FormattedMessage id="todo.details.completedAt" />{" "}
                                                                    {format(new Date(todo.completedAt), "PPP", { locale: dateLocale })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex border-t border-gray-100 dark:border-gray-800">
                                        <Link href={`/details/${todo.id}`} className="flex-1">
                                            <Button
                                                variant="ghost"
                                                className="w-full rounded-none h-10 text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                <FormattedMessage id="todo.actions.details" />
                                            </Button>
                                        </Link>
                                        <div className="w-px bg-gray-100 dark:bg-gray-800"></div>
                                        <Button
                                            variant="ghost"
                                            className="flex-1 rounded-none h-10 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            onClick={() => onDelete(todo.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            <FormattedMessage id="todo.actions.delete" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-xs text-gray-400 ml-6 mb-4"><FormattedMessage id="todo.list.empty.unassigned" /></div>
                    )}
                </div>
            ))}
            {/* Unzugeordnete Todos */}
            {unassignedTodos.length > 0 && (
                <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2"><FormattedMessage id="todo.list.empty.unassigned" /></div>
                    {unassignedTodos.map((todo) => (
                        <Card
                            key={todo.id}
                            className={`mb-2 overflow-hidden bg-white dark:bg-gray-900 ${
                                todo.completed ? "border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="pt-1">
                                            <Checkbox
                                                id={`todo-${todo.id}`}
                                                checked={todo.completed}
                                                onCheckedChange={() => onToggle(todo.id)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap justify-between items-start gap-2">
                                                <h3
                                                    className={`font-medium cursor-pointer ${
                                                        todo.completed
                                                            ? "line-through text-gray-500 dark:text-gray-400"
                                                            : "text-gray-900 dark:text-gray-100"
                                                    }`}
                                                    onClick={() => toggleExpand(todo.id)}
                                                >
                                                    {todo.title}
                                                </h3>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        className={
                                                            todo.completed
                                                                ? "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                                                                : "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                                                        }
                                                    >
                                                        <FormattedMessage id={todo.completed ? "todo.status.completed" : "todo.status.open"} />
                                                    </Badge>
                                                </div>
                                            </div>

                                            {expandedTodo === todo.id && (
                                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <p className="whitespace-pre-wrap">{todo.description}</p>
                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <p>
                                                            <FormattedMessage id="todo.details.createdAt" />{" "}
                                                            {format(new Date(todo.createdAt), "PPP", { locale: dateLocale })}
                                                        </p>
                                                        {todo.completed && todo.completedAt && (
                                                            <p>
                                                                <FormattedMessage id="todo.details.completedAt" />{" "}
                                                                {format(new Date(todo.completedAt), "PPP", { locale: dateLocale })}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex border-t border-gray-100 dark:border-gray-800">
                                    <Link href={`/details/${todo.id}`} className="flex-1">
                                        <Button
                                            variant="ghost"
                                            className="w-full rounded-none h-10 text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            <FormattedMessage id="todo.actions.details" />
                                        </Button>
                                    </Link>
                                    <div className="w-px bg-gray-100 dark:bg-gray-800"></div>
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-none h-10 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                        onClick={() => onDelete(todo.id)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        <FormattedMessage id="todo.actions.delete" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
