"use client"

import { Checkbox } from "../ui/shadcn/checkbox"
import { Button } from "../ui/shadcn/button"
import { Card, CardContent } from "../ui/shadcn/card"
import { Edit, Trash2 } from "lucide-react"
import { FormattedMessage, FormattedDate, FormattedTime } from "react-intl"
import type { Todo } from "../../app/actions/todo-actions"
import type { Folder as FolderType } from "../../app/actions/folder-actions"
import type { TodoEnhancement, Priority } from "../../hooks/ToDo/use-todo-enhancements"
import PrioritySelector from "../priority-selector"
import DueDatePicker from "../due-date-picker"
import { useEffect, useState } from "react"

interface TodoListItemProps {
    todo: Todo
    enhancement: TodoEnhancement
    folder?: FolderType | null
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit?: (id: string) => void
    onPriorityChange?: (id: string, priority: Priority) => void
    onDueDateChange?: (id: string, dueDate: Date | undefined) => void
}

export default function TodoListItem({
                                         todo,
                                         enhancement,
                                         folder,
                                         onToggle,
                                         onDelete,
                                         onEdit,
                                         onPriorityChange,
                                         onDueDateChange,
                                     }: TodoListItemProps) {
    const [isOverdue, setIsOverdue] = useState(false)

    useEffect(() => {
        if (!enhancement.dueDate || todo.completed) {
            setIsOverdue(false)
            return
        }
        const checkOverdue = () => {
            setIsOverdue(new Date(enhancement.dueDate!) < new Date())
        }
        checkOverdue()
        const interval = setInterval(checkOverdue, 1000 * 30) // alle 30 Sekunden prüfen
        return () => clearInterval(interval)
    }, [enhancement.dueDate, todo.completed])

    return (
        <Card className="transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                    <Checkbox checked={todo.completed} onCheckedChange={() => onToggle(todo.id)} className="flex-shrink-0 mt-1" />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3
                                className={`font-medium text-sm sm:text-base ${
                                    todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                                }`}
                            >
                                {todo.title}
                            </h3>

                            {/* Überfällig-Anzeige */}
                            {isOverdue && !todo.completed && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold dark:bg-red-900/40 dark:text-red-300 animate-pulse">
                                    <FormattedMessage id="todo.overdue" defaultMessage="Überfällig" />
                                </span>
                            )}

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

                            {/* Unassigned Anzeige */}
                            {!folder && todo.folderId === null && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400">
                    <FormattedMessage id="folder.unassigned" />
                  </span>
                                </div>
                            )}
                        </div>

                        {/* Priorität und Fälligkeitsdatum */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {onPriorityChange && (
                                <PrioritySelector
                                    priority={enhancement.priority}
                                    onPriorityChange={(priority) => onPriorityChange(todo.id, priority)}
                                />
                            )}

                            {onDueDateChange && (
                                <DueDatePicker dueDate={enhancement.dueDate} onDateChange={(date) => onDueDateChange(todo.id, date)} />
                            )}
                        </div>

                        {todo.description && (
                            <p
                                className={`text-xs sm:text-sm mt-1 ${
                                    todo.completed ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"
                                }`}
                            >
                                {todo.description}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>
                <FormattedMessage id="todo.details.createdAt" />{" "}
                  <FormattedDate value={todo.createdAt} day="2-digit" month="2-digit" year="numeric" />{" "}
                  <FormattedTime value={todo.createdAt} hour="2-digit" minute="2-digit" />
              </span>

                            {todo.completed && todo.completedAt && (
                                <span>
                  <FormattedMessage id="todo.details.completedAt" />{" "}
                                    <FormattedDate value={todo.completedAt} day="2-digit" month="2-digit" year="numeric" />{" "}
                                    <FormattedTime value={todo.completedAt} hour="2-digit" minute="2-digit" />
                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(todo.id)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(todo.id)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
