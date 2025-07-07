"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../ui/shadcn/button"
import { Card, CardContent } from "../ui/shadcn/card"
import { Checkbox } from "../ui/shadcn/checkbox"
import { Badge } from "../ui/shadcn/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/shadcn/select"
import { Eye, Trash, Plus, FolderOpen } from "lucide-react"
import type { Todo } from "../../app/actions/todo-actions"
import type { Folder } from "../../app/actions/folder-actions"
import { format } from "date-fns"
import { de, enUS } from "date-fns/locale"
import { FormattedMessage } from "react-intl"
import { useLocale } from "../../contexts/locale-context"
import { useFolders } from "../../hooks/useFolders"
import { moveTodoToFolder } from "../../app/actions/todo-actions"

interface TodoListWithFoldersProps {
    todos: Todo[]
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string) => void
    isFiltered?: boolean
}

export default function TodoListWithFolders({
                                                todos,
                                                onToggle,
                                                onDelete,
                                                isFiltered = false,
                                            }: TodoListWithFoldersProps) {
    const { locale } = useLocale()
    const [expandedTodo, setExpandedTodo] = useState<string | null>(null)
    const { folders } = useFolders()

    // Locale für date-fns bestimmen
    const dateLocale = locale === "en" ? enUS : de

    const toggleExpand = (id: string) => {
        setExpandedTodo(expandedTodo === id ? null : id)
    }

    const handleMoveToFolder = async (todoId: string, folderId: string | null) => {
        await moveTodoToFolder(todoId, folderId)
    }

    const getFolderById = (folderId: string | null): Folder | null => {
        if (!folderId) return null
        return folders.find((f) => f.id === folderId) || null
    }

    // Gruppiere Todos nach Ordnern
    const todosByFolder = todos.reduce(
        (acc, todo) => {
            const folderId = todo.folderId || "unassigned"
            if (!acc[folderId]) {
                acc[folderId] = []
            }
            acc[folderId].push(todo)
            return acc
        },
        {} as Record<string, Todo[]>,
    )

    const renderTodoCard = (todo: Todo) => {
        const folder = getFolderById(todo.folderId)

        return (
            <Card key={todo.id} className={`overflow-hidden ${todo.completed ? "border-green-200" : "border-gray-200"}`}>
                <CardContent className="p-0">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <Checkbox id={`todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => onToggle(todo.id)} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3
                                            className={`font-medium cursor-pointer ${
                                                todo.completed ? "line-through text-gray-500" : "text-gray-900"
                                            }`}
                                            onClick={() => toggleExpand(todo.id)}
                                        >
                                            {todo.title}
                                        </h3>
                                        {folder && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: folder.color }} />
                                                <span className="text-xs text-gray-500">{folder.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Badge className={todo.completed ? "bg-green-500" : "bg-yellow-500"}>
                                        <FormattedMessage id={todo.completed ? "todo.status.completed" : "todo.status.open"} />
                                    </Badge>
                                </div>

                                {expandedTodo === todo.id && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p className="whitespace-pre-wrap">{todo.description}</p>

                                        {/* Ordner verschieben */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <FolderOpen className="h-4 w-4" />
                                            <Select
                                                value={todo.folderId || "none"}
                                                onValueChange={(value) => handleMoveToFolder(todo.id, value === "none" ? null : value)}
                                            >
                                                <SelectTrigger className="w-48">
                                                    <SelectValue />
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

                                        <div className="mt-2 text-xs text-gray-500">
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

                    <div className="flex border-t border-gray-100">
                        <Link href={`/details/${todo.id}`} className="flex-1">
                            <Button variant="ghost" className="w-full rounded-none h-10 text-purple-700 hover:bg-purple-50">
                                <Eye className="mr-2 h-4 w-4" />
                                <FormattedMessage id="todo.actions.details" />
                            </Button>
                        </Link>
                        <div className="w-px bg-gray-100"></div>
                        <Button
                            variant="ghost"
                            className="flex-1 rounded-none h-10 text-red-600 hover:bg-red-50"
                            onClick={() => onDelete(todo.id)}
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            <FormattedMessage id="todo.actions.delete" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (todos.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                {isFiltered ? (
                    <p className="text-gray-500">
                        <FormattedMessage id="todo.filter.noResults" />
                    </p>
                ) : (
                    <>
                        <p className="text-gray-500">
                            <FormattedMessage id="todo.list.empty" />
                        </p>
                        <Link href="/add">
                            <Button className="mt-4 bg-purple-700 hover:bg-purple-800">
                                <Plus className="mr-2 h-4 w-4" />
                                <FormattedMessage id="todo.list.createFirst" />
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Nicht zugeordnete Todos */}
            {todosByFolder["unassigned"] && todosByFolder["unassigned"].length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400" />
                        <FormattedMessage id="folder.unassigned" />
                        <Badge variant="secondary">{todosByFolder["unassigned"].length}</Badge>
                    </h3>
                    <div className="space-y-4">{todosByFolder["unassigned"].map(renderTodoCard)}</div>
                </div>
            )}

            {/* Todos nach Ordnern gruppiert */}
            {folders.map((folder) => {
                const folderTodos = todosByFolder[folder.id] || []
                if (folderTodos.length === 0) return null

                return (
                    <div key={folder.id}>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: folder.color }} />
                            {folder.name}
                            <Badge variant="secondary">{folderTodos.length}</Badge>
                        </h3>
                        <div className="space-y-4">{folderTodos.map(renderTodoCard)}</div>
                    </div>
                )
            })}
        </div>
    )
}
