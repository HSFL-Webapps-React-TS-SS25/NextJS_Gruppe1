"use client"

import type React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/shadcn/card"
import { Button } from "../ui/shadcn/button"
import { MoreVertical, Plus, FolderOpen } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/shadcn/dropdown-menu"
import type { Folder } from "../../app/actions/folder-actions"
import type { Todo } from "../../app/actions/todo-actions"
import { FormattedMessage } from "react-intl"
import ProgressRing from "../progress-ring"

interface FolderCardProps {
    folder: Folder | null
    todos: Todo[]
    children: React.ReactNode
    onEditFolder: (folder: Folder) => void
    onDeleteFolder: (id: string) => void
    onAddTodo: (folderId: string | null) => void
}

export default function FolderCard({
                                       folder,
                                       todos,
                                       children,
                                       onEditFolder,
                                       onDeleteFolder,
                                       onAddTodo,
                                   }: FolderCardProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: folder?.id || "unassigned",
    })

    // Berechne Fortschritt
    const completedTodos = todos.filter((todo) => todo.completed).length
    const totalTodos = todos.length
    const progress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

    return (
        <Card
            ref={setNodeRef}
            className={`min-h-[250px] sm:min-h-[300px] transition-all duration-200 shadow-sm sm:shadow-md bg-card border-border ${isOver ? "ring-2 ring-primary bg-accent" : ""}`}
        >
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 bg-background border-b border-border">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg min-w-0 flex-1">
                        <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: folder?.color || "#6b7280" }}
                        />
                        <span className="truncate text-foreground text-left flex items-center h-full">
              {folder?.name || <FormattedMessage id="folder.unassigned" />}
            </span>
                        <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1 flex-shrink-0">
              ({todos.length})
            </span>
                    </CardTitle>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Fortschritts-Ring */}
                        {totalTodos > 0 && <ProgressRing progress={progress} size={32} strokeWidth={3} />}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAddTodo(folder?.id || null)}
                            className="h-8 w-8 p-0 touch-manipulation"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        {folder && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 touch-manipulation">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => onEditFolder(folder)} className="h-10">
                                        <FormattedMessage id="folder.edit" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDeleteFolder(folder.id)}
                                        className="text-destructive h-10"
                                    >
                                        <FormattedMessage id="folder.delete" />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0 px-4 sm:px-6">
                <div className="space-y-2 min-h-[150px] sm:min-h-[200px]">
                    {todos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[150px] sm:h-[200px] text-muted-foreground">
                            <FolderOpen className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
                            <p className="text-xs sm:text-sm text-center px-2">
                                {folder ? <FormattedMessage id="folder.empty" /> : <FormattedMessage id="todo.list.empty.unassigned" />}
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAddTodo(folder?.id || null)}
                                className="mt-2 text-primary h-10 px-4 touch-manipulation"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                <span className="text-xs sm:text-sm">
                  <FormattedMessage id="todo.add.title" />
                </span>
                            </Button>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
