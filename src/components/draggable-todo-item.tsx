"use client"
import { useDraggable } from "@dnd-kit/core"
import type React from "react"

import { Card, CardContent } from "./ui/shadcn/card"
import { Button } from "./ui/shadcn/button"
import { Checkbox } from "./ui/shadcn/checkbox"
import { MoreVertical, Edit, Trash2, Calendar, Clock, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/shadcn/dropdown-menu"
import type { Todo } from "../app/actions/todo-actions"
import type { TodoEnhancement, Priority } from "../hooks/ToDo/use-todo-enhancements"
import { FormattedMessage } from "react-intl"
import PrioritySelector from "./priority-selector"
import DueDatePicker from "./due-date-picker"
import { format, isToday, isPast } from "date-fns"
import { useEffect, useState } from "react"

interface DraggableTodoItemProps {
    todo: Todo
    enhancement: TodoEnhancement
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string) => void
    onPriorityChange: (todoId: string, priority: Priority) => void
    onDueDateChange: (todoId: string, dueDate: Date | undefined) => void
    forceTimeUpdate?: number
}

export default function DraggableTodoItem({
                                              todo,
                                              enhancement,
                                              onToggle,
                                              onDelete,
                                              onEdit,
                                              onPriorityChange,
                                              onDueDateChange,
                                              forceTimeUpdate = 0,
                                          }: DraggableTodoItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: todo.id,
    })

    // State für Live-Updates des Fälligkeitsstatus
    const [, setCurrentTime] = useState(new Date())

    // Aktualisiere die Zeit jede Minute für Live-Updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000) // Jede Minute

        return () => clearInterval(interval)
    }, [])

    // Sofortiges Update wenn forceTimeUpdate sich ändert
    useEffect(() => {
        if (forceTimeUpdate > 0) {
            console.log("🔄 Force updating time for todo:", todo.title)
            setCurrentTime(new Date())
        }
    }, [forceTimeUpdate, todo.title])

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined

    // Prüfe Fälligkeitsstatus basierend auf aktueller Zeit
    const isOverdue = enhancement.dueDate && isPast(enhancement.dueDate) && !todo.completed
    const isDueToday = enhancement.dueDate && isToday(enhancement.dueDate) && !todo.completed && !isOverdue

    // Handler für Priority Change
    const handlePriorityChange = (priority: Priority) => {
        onPriorityChange(todo.id, priority)
    }

    // Handler für Due Date Change
    const handleDueDateChange = (date: Date | undefined) => {
        onDueDateChange(todo.id, date)
    }

    // Handler für Edit mit Event Stop
    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onEdit(todo.id)
    }

    // Handler für Delete mit Event Stop
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onDelete(todo.id)
    }

    // Handler für Toggle mit Event Stop
    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(todo.id)
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`mb-2 transition-all duration-500 cursor-grab active:cursor-grabbing touch-manipulation ${
                isDragging ? "opacity-50 rotate-2 scale-105" : ""
            } ${
                isOverdue
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-red-200 dark:shadow-red-800"
                    : isDueToday
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-yellow-200 dark:shadow-yellow-800"
                        : "hover:shadow-md"
            }`}
        >
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                    {/* Checkbox - OHNE Drag-Handler */}
                    <div onClick={handleToggle} className="mt-1 flex-shrink-0 cursor-pointer">
                        <Checkbox checked={todo.completed} className="touch-manipulation pointer-events-none" />
                    </div>

                    {/* Hauptinhalt - MIT Drag-Handler nur auf dem Titel */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                {/* Titel - MIT Drag-Handler */}
                                <div {...attributes} {...listeners}>
                                    <h3
                                        className={`font-medium text-sm sm:text-base leading-tight transition-colors duration-500 cursor-grab active:cursor-grabbing ${
                                            todo.completed
                                                ? "line-through text-gray-500 dark:text-gray-400"
                                                : isOverdue
                                                    ? "text-red-800 dark:text-red-200"
                                                    : isDueToday
                                                        ? "text-yellow-800 dark:text-yellow-200"
                                                        : "text-gray-900 dark:text-gray-100"
                                        }`}
                                    >
                                        {todo.title}
                                        {isOverdue && <AlertTriangle className="inline h-4 w-4 ml-1 text-red-500 animate-pulse" />}
                                        {isDueToday && <Clock className="inline h-4 w-4 ml-1 text-yellow-500" />}
                                    </h3>
                                </div>

                                {/* Beschreibung - MIT Drag-Handler */}
                                {todo.description && (
                                    <div {...attributes} {...listeners}>
                                        <p
                                            className={`text-xs sm:text-sm mt-1 transition-colors duration-500 cursor-grab active:cursor-grabbing ${
                                                todo.completed
                                                    ? "text-gray-400 dark:text-gray-500"
                                                    : isOverdue
                                                        ? "text-red-600 dark:text-red-300"
                                                        : isDueToday
                                                            ? "text-yellow-600 dark:text-yellow-300"
                                                            : "text-gray-600 dark:text-gray-300"
                                            }`}
                                        >
                                            {todo.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Menu - OHNE Drag-Handler */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 flex-shrink-0 touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 z-50">
                                    <DropdownMenuItem onClick={handleEdit} className="h-10 cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" />
                                        <FormattedMessage id="todo.actions.edit" />
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-red-600 dark:text-red-400 h-10 cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <FormattedMessage id="todo.actions.delete" />
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Controls - OHNE Drag-Handler */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <PrioritySelector priority={enhancement.priority} onPriorityChange={handlePriorityChange} />

                            <DueDatePicker dueDate={enhancement.dueDate} onDateChange={handleDueDateChange} />

                            {enhancement.dueDate && (
                                <div
                                    className={`text-xs px-2 py-1 rounded-full transition-all duration-500 ${
                                        isOverdue
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse"
                                            : isDueToday
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                    }`}
                                >
                                    <Calendar className="inline h-3 w-3 mr-1" />
                                    {format(enhancement.dueDate, "dd.MM HH:mm")}
                                    {isOverdue && " ("}
                                    {isOverdue && <FormattedMessage id="dueDate.overdue" />}
                                    {isOverdue && ")"}
                                    {isDueToday && " ("}
                                    {isDueToday && <FormattedMessage id="dueDate.today" />}
                                    {isDueToday && ")"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
