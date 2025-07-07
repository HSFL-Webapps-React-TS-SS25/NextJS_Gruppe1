"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../ui/shadcn/button"
import { Input } from "../ui/shadcn/input"
import { Label } from "../ui/shadcn/label"
import { Textarea } from "../ui/shadcn/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/shadcn/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/shadcn/card"
import { Checkbox } from "../ui/shadcn/checkbox"
import { FormattedMessage } from "react-intl"
import { useFolders } from "../../hooks/useFolders"
import FolderManager from "../Folder/folder-manager"
import type { Todo, TodoInput } from "../../app/actions/todo-actions"

interface TodoFormWithFoldersProps {
    onSubmit: (todo: TodoInput) => void
    editingTodo?: Todo | null
    onUpdate?: (todo: Todo) => void
    onCancel?: () => void
}

export default function TodoFormWithFolders({ onSubmit, editingTodo, onUpdate, onCancel }: TodoFormWithFoldersProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [completed, setCompleted] = useState(false)
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { folders, addFolder } = useFolders()

    // Formular mit editingTodo füllen
    useEffect(() => {
        if (editingTodo) {
            setTitle(editingTodo.title)
            setDescription(editingTodo.description)
            setCompleted(editingTodo.completed)
            setSelectedFolderId(editingTodo.folderId)
        } else {
            setTitle("")
            setDescription("")
            setCompleted(false)
            setSelectedFolderId(null)
        }
    }, [editingTodo])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setIsSubmitting(true)

        try {
            if (editingTodo && onUpdate) {
                await onUpdate({
                    ...editingTodo,
                    title: title.trim(),
                    description: description.trim(),
                    completed,
                    folderId: selectedFolderId,
                })
            } else {
                await onSubmit({
                    title: title.trim(),
                    description: description.trim(),
                    folderId: selectedFolderId,
                })
            }

            // Formular zurücksetzen nach erfolgreichem Hinzufügen
            if (!editingTodo) {
                setTitle("")
                setDescription("")
                setCompleted(false)
                setSelectedFolderId(null)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setTitle("")
        setDescription("")
        setCompleted(false)
        setSelectedFolderId(null)
        onCancel?.()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <FormattedMessage id={editingTodo ? "todo.edit.title" : "todo.add.title"} />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">
                            <FormattedMessage id="todo.form.title.label" />
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Titel der Aufgabe"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">
                            <FormattedMessage id="todo.form.description.label" />
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Beschreibung der Aufgabe"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="folder">Ordner</Label>
                        <div className="flex gap-2">
                            <Select
                                value={selectedFolderId || "none"}
                                onValueChange={(value) => setSelectedFolderId(value === "none" ? null : value)}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Ordner auswählen" />
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
                            <FolderManager onAddFolder={addFolder} />
                        </div>
                    </div>

                    {editingTodo && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="completed"
                                checked={completed}
                                onCheckedChange={(checked) => setCompleted(checked as boolean)}
                            />
                            <Label htmlFor="completed">
                                <FormattedMessage id="todo.form.completed.label" />
                            </Label>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {editingTodo && (
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                <FormattedMessage id="todo.form.cancel" />
                            </Button>
                        )}
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? (
                                <FormattedMessage id="todo.form.saving" />
                            ) : (
                                <FormattedMessage id={editingTodo ? "todo.form.update" : "todo.form.save"} />
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
