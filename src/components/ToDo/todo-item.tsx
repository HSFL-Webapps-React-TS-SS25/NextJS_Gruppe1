"use client"

import { FormattedMessage, FormattedDate, FormattedTime } from "react-intl"
import { Button } from "../ui/shadcn/button"
import { Card, CardContent } from "../ui/shadcn/card"
import { Checkbox } from "../ui/shadcn/checkbox"
import { Edit, Trash2, Calendar, CheckCircle2 } from "lucide-react"
import type { Todo } from "../../app/actions/todo-actions"

interface TodoItemProps {
    todo: Todo
    onToggle: (id: string) => void
    onDelete: (id: string) => void
    onEdit: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
    return (
        <Card
            className={`glass-card modern-shadow hover-lift border-slate-200/50 transition-all duration-300 ${
                todo.completed ? "bg-gradient-to-r from-green-50 to-emerald-50" : "bg-white"
            }`}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => onToggle(todo.id)}
                            className="h-5 w-5 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            className={`font-semibold text-lg mb-2 ${
                                todo.completed ? "line-through text-slate-500" : "text-slate-800"
                            }`}
                        >
                            {todo.title}
                        </h3>

                        {todo.description && (
                            <p className={`text-sm mb-3 ${todo.completed ? "text-slate-400" : "text-slate-600"}`}>
                                {todo.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                  <FormattedMessage id="todo.details.createdAt" />{" "}
                                    <FormattedDate value={todo.createdAt} day="2-digit" month="2-digit" year="numeric" />{" "}
                                    <FormattedTime value={todo.createdAt} hour="2-digit" minute="2-digit" />
                </span>
                            </div>

                            {todo.completed && todo.completedAt && (
                                <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>
                    <FormattedMessage id="todo.details.completedAt" />{" "}
                                        <FormattedDate value={todo.completedAt} day="2-digit" month="2-digit" year="numeric" />{" "}
                                        <FormattedTime value={todo.completedAt} hour="2-digit" minute="2-digit" />
                  </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(todo.id)}
                            disabled={todo.completed}
                            className={`h-9 w-9 p-0 rounded-lg ${
                                todo.completed
                                    ? "text-slate-400 cursor-not-allowed"
                                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(todo.id)}
                            className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
