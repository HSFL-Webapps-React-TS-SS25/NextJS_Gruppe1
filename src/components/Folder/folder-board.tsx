"use client"

import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { useState } from "react"
import { useFolders } from "../../hooks/useFolders"
import { useTodos } from "../../hooks/ToDo/useTodos"
import { useTodoEnhancements } from "../../hooks/ToDo/use-todo-enhancements"
import { moveTodoToFolder, toggleTodoStatus } from "../../app/actions/todo-actions"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "../../hooks/use-sonner"
import FolderCard from "./folder-card"
import DraggableTodoItem from "../draggable-todo-item"
import FolderManager from "./folder-manager"
import DueDateNotification from "../due-date-notification"
import { Button } from "../ui/shadcn/button"
import { Plus } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Todo } from "../../app/actions/todo-actions"
import type { Priority } from "../../hooks/ToDo/use-todo-enhancements"
import type { Folder } from "../../app/actions/folder-actions"
import { useSession } from "next-auth/react"

interface FolderBoardProps {
    currentView: "list" | "board"
}

export default function FolderBoard({ currentView }: FolderBoardProps) {
    const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null)
    const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
    const [forceTimeUpdate, setForceTimeUpdate] = useState(0) // Trigger für sofortige Updates
    const intl = useIntl()
    const router = useRouter()
    const { toast } = useToast()
    const { data: session } = useSession()
    const userId = session?.user?.id

    const queryClient = useQueryClient()
    const { folders, addFolder, updateFolder, deleteFolder } = useFolders()
    const { todos, deleteTodo: deleteTodoMutation } = useTodos()
    const { updateTodoEnhancement, getTodoEnhancement, sortTodosByPriority } = useTodoEnhancements()

    // Verbesserte Gruppierung der Todos nach Ordnern mit Sortierung
    const todosByFolder = todos.reduce(
        (acc, todo) => {
            const folderId = todo.folderId || "unassigned"

            // Prüfe, ob der Ordner noch existiert (außer bei "unassigned")
            if (folderId !== "unassigned") {
                const folderExists = folders.some((folder) => folder.id === folderId)
                if (!folderExists) {
                    if (!acc["unassigned"]) {
                        acc["unassigned"] = []
                    }
                    acc["unassigned"].push(todo)
                    return acc
                }
            }

            if (!acc[folderId]) {
                acc[folderId] = []
            }
            acc[folderId].push(todo)
            return acc
        },
        {} as Record<string, Todo[]>,
    )

    // Sortiere Todos in jedem Ordner nach Priorität
    Object.keys(todosByFolder).forEach((folderId) => {
        todosByFolder[folderId] = sortTodosByPriority(todosByFolder[folderId])
    })

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const todo = todos.find((t) => t.id === active.id)
        setDraggedTodo(todo || null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setDraggedTodo(null)
            return
        }

        const todoId = active.id as string
        const folderId = over.id === "unassigned" ? null : (over.id as string)

        try {
            const currentTodo = todos.find((t) => t.id === todoId)
            if (currentTodo) {
                queryClient.setQueryData(["todos", userId], (oldTodos: Todo[] | undefined) => {
                    if (!oldTodos) return []
                    return oldTodos.map((todo) => (todo.id === todoId ? { ...todo, folderId: folderId } : todo))
                })

                const targetFolderName = folderId
                    ? folders.find((f) => f.id === folderId)?.name
                    : intl.formatMessage({ id: "folder.unassigned" })

                toast.success(intl.formatMessage({ id: "notification.todo.moved" }), {
                    description: intl.formatMessage(
                        { id: "notification.todo.moved.description" },
                        { title: currentTodo.title, folder: targetFolderName },
                    ),
                })
            }

            if (userId) {
                await moveTodoToFolder(todoId, folderId, userId)
            }
            await queryClient.invalidateQueries({ queryKey: ["todos", userId] })
            await queryClient.invalidateQueries({ queryKey: ["folders", userId] })
        } catch (error) {
            console.error("Fehler beim Verschieben des Todos:", error)
            toast.error(intl.formatMessage({ id: "notification.error.move" }), {
                description: intl.formatMessage({ id: "notification.error.move.description" }),
            })
            await queryClient.invalidateQueries({ queryKey: ["todos", userId] })
        }

        setDraggedTodo(null)
    }

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

    const handleAddTodo = (folderId: string | null) => {
        const params = new URLSearchParams()
        if (folderId) params.set("folderId", folderId)
        params.set("returnView", currentView)
        router.push(`/add?${params.toString()}`)
    }

    const handleEditFolder = (folder: Folder) => {
        setEditingFolder(folder)
    }

    const handleUpdateFolder = async (folder: Folder) => {
        try {
            await updateFolder(folder)
            setEditingFolder(null)
            // Verwende existierende Übersetzungsschlüssel oder einfache Nachricht
            toast.success("Ordner erfolgreich aktualisiert", {
                description: `Der Ordner "${folder.name}" wurde erfolgreich aktualisiert.`,
            })
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Ordners:", error)
            toast.error(intl.formatMessage({ id: "notification.error.update" }), {
                description: intl.formatMessage({ id: "notification.error.update.description" }),
            })
        }
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

    // Handler für Notification Dismiss - triggert sofortiges Update
    const handleNotificationDismiss = () => {
        console.log("🔄 Forcing immediate time update for all todos")
        setForceTimeUpdate((prev) => prev + 1) // Trigger für alle Child-Komponenten
    }

    // Berechne die tatsächlichen Zahlen für Debug
    const unassignedCount = todosByFolder["unassigned"]?.length || 0
    const folderCounts = folders.map((folder) => ({
        name: folder.name,
        count: todosByFolder[folder.id]?.length || 0,
    }))

    return (
        <>
            <DueDateNotification todos={todos} onDismiss={handleNotificationDismiss} />

            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
                        <FormattedMessage id="folder.title" />
                    </h2>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Link href={`/add?returnView=${currentView}`} className="w-full sm:w-auto">
                            <Button className="h-10 px-6 min-w-[180px] flex items-center justify-center">
                                <Plus className="mr-2 h-4 w-4" />
                                <FormattedMessage id="todo.add.title" />
                            </Button>
                        </Link>
                        <div className="w-full sm:w-auto">
                            <FolderManager
                                onAddFolder={addFolder}
                                onUpdateFolder={handleUpdateFolder}
                                editingFolder={editingFolder}
                                buttonClassName="h-10 px-6 min-w-[140px] flex items-center justify-center"
                            />
                        </div>
                    </div>
                </div>

                {/* Debug-Informationen */}
                <div className="hidden sm:block text-sm text-muted-foreground bg-background border border-border p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">
                                <FormattedMessage id="debug.overview" />
                            </h4>
                            <div className="space-y-1">
                                <p>
                                    <FormattedMessage id="debug.todos" />: <span className="font-medium">{todos.length}</span>
                                </p>
                                <p>
                                    <FormattedMessage id="debug.folders" />: <span className="font-medium">{folders.length}</span>
                                </p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">
                                <FormattedMessage id="debug.distribution" />
                            </h4>
                            <div className="space-y-1">
                                <p>
                                    <FormattedMessage id="folder.unassigned" />: <span className="font-medium">{unassignedCount}</span>
                                </p>
                                {folderCounts.map((folder, index) => (
                                    <p key={index}>
                                        {folder.name}: <span className="font-medium">{folder.count}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Warnung bei verwaisten Todos */}
                    {todos.some((todo) => todo.folderId && !folders.some((folder) => folder.id === todo.folderId)) && (
                        <div className="mt-4 p-3 bg-accent border border-accent rounded-md text-accent-foreground">
                            <FormattedMessage id="debug.warning.orphaned" />
                        </div>
                    )}
                </div>

                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Nicht zugeordnete Todos */}
                        <FolderCard
                            folder={null}
                            todos={todosByFolder["unassigned"] || []}
                            onAddTodo={handleAddTodo}
                            onEditFolder={handleEditFolder}
                            onDeleteFolder={deleteFolder}
                            currentView={currentView}
                        >
                            {(todosByFolder["unassigned"] || []).map((todo) => (
                                <DraggableTodoItem
                                    key={todo.id}
                                    todo={todo}
                                    enhancement={getTodoEnhancement(todo.id)}
                                    onToggle={handleToggleTodo}
                                    onDelete={handleDeleteTodo}
                                    onEdit={handleEditTodo}
                                    onPriorityChange={handlePriorityChange}
                                    onDueDateChange={handleDueDateChange}
                                    forceTimeUpdate={forceTimeUpdate}
                                />
                            ))}
                        </FolderCard>

                        {/* Alle Ordner */}
                        {folders.map((folder) => {
                            const folderTodos = todosByFolder[folder.id] || []
                            return (
                                <FolderCard
                                    key={folder.id}
                                    folder={folder}
                                    todos={folderTodos}
                                    onEditFolder={handleEditFolder}
                                    onDeleteFolder={deleteFolder}
                                    onAddTodo={handleAddTodo}
                                    currentView={currentView}
                                >
                                    {folderTodos.map((todo) => (
                                        <DraggableTodoItem
                                            key={todo.id}
                                            todo={todo}
                                            enhancement={getTodoEnhancement(todo.id)}
                                            onToggle={handleToggleTodo}
                                            onDelete={handleDeleteTodo}
                                            onEdit={handleEditTodo}
                                            onPriorityChange={handlePriorityChange}
                                            onDueDateChange={handleDueDateChange}
                                            forceTimeUpdate={forceTimeUpdate}
                                        />
                                    ))}
                                </FolderCard>
                            )
                        })}
                    </div>

                    <DragOverlay>
                        {draggedTodo ? (
                            <DraggableTodoItem
                                todo={draggedTodo}
                                enhancement={getTodoEnhancement(draggedTodo.id)}
                                onToggle={() => {}}
                                onDelete={() => {}}
                                onEdit={() => {}}
                                onPriorityChange={() => {}}
                                onDueDateChange={() => {}}
                                forceTimeUpdate={forceTimeUpdate}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </>
    )
}
