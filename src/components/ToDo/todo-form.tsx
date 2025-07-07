"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../ui/shadcn/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/shadcn/card"
import { Input } from "../ui/shadcn/input"
import { Textarea } from "../ui/shadcn/textarea"
import { Save, XCircle } from "lucide-react"
import type { Todo, TodoInput } from "../../app/actions/todo-actions"
import { useIntl, FormattedMessage } from "react-intl"

interface TodoFormProps {
    onSubmit: (todo: TodoInput) => void
    editingTodo: Todo | null
    onUpdate: (todo: Todo) => void
    onCancel: () => void
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit, editingTodo, onUpdate, onCancel }) => {
    const intl = useIntl()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (editingTodo) {
            setTitle(editingTodo.title)
            setDescription(editingTodo.description)
        } else {
            setTitle("")
            setDescription("")
        }
    }, [editingTodo])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) {
            setError(intl.formatMessage({ id: "todo.form.error.titleRequired" }))
            return
        }

        if (editingTodo) {
            onUpdate({ ...editingTodo, title, description })
        } else {
            onSubmit({ title, description })
        }

        setTitle("")
        setDescription("")
        setError(null)
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">
                    <FormattedMessage id={editingTodo ? "todo.edit.title" : "todo.add.title"} />
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
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-gray-50 dark:bg-gray-800 mt-4">
                    {editingTodo && (
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={onCancel}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            <FormattedMessage id="todo.form.cancel" />
                        </Button>
                    )}
                    <Button
                        type="submit"
                        className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        <FormattedMessage id={editingTodo ? "todo.form.update" : "todo.form.save"} />
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

export default TodoForm
