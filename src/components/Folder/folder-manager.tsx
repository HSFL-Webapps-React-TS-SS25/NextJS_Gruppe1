"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../ui/shadcn/button"
import { Input } from "../ui/shadcn/input"
import { Label } from "../ui/shadcn/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/shadcn/dialog"
import { Plus } from "lucide-react"
import { FormattedMessage } from "react-intl"
import type { Folder, FolderInput } from "../../app/actions/folder-actions"

interface FolderManagerProps {
    onAddFolder: (folder: FolderInput) => void
    onUpdateFolder?: (folder: Folder) => void
    editingFolder?: Folder | null
    buttonClassName?: string
}

const FOLDER_COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#6b7280",
]

export default function FolderManager({ onAddFolder, onUpdateFolder, editingFolder, buttonClassName }: FolderManagerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState("")
    const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0])

    // Öffne Dialog automatisch wenn editingFolder gesetzt wird
    useEffect(() => {
        if (editingFolder) {
            setName(editingFolder.name)
            setSelectedColor(editingFolder.color)
            setIsOpen(true)
        }
    }, [editingFolder])

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setName("")
            setSelectedColor(FOLDER_COLORS[0])
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        if (editingFolder && onUpdateFolder) {
            onUpdateFolder({
                ...editingFolder,
                name: name.trim(),
                color: selectedColor,
            })
        } else {
            onAddFolder({
                name: name.trim(),
                color: selectedColor,
            })
        }

        setName("")
        setSelectedColor(FOLDER_COLORS[0])
        setIsOpen(false)
    }

    const handleCancel = () => {
        setName("")
        setSelectedColor(FOLDER_COLORS[0])
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={buttonClassName || "bg-purple-700 hover:bg-purple-800"}>
                    <Plus className="mr-2 h-4 w-4" />
                    <FormattedMessage id="folder.add" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <FormattedMessage id={editingFolder ? "folder.edit" : "folder.add"} />
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="folder-name">
                            <FormattedMessage id="folder.name.placeholder" />
                        </Label>
                        <Input
                            id="folder-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ordnername eingeben..."
                            required
                        />
                    </div>

                    <div>
                        <Label>
                            <FormattedMessage id="folder.color.label" />
                        </Label>
                        <div className="flex gap-2 mt-2">
                            {FOLDER_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${
                                        selectedColor === color ? "border-gray-900" : "border-gray-300"
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            <FormattedMessage id="folder.cancel" />
                        </Button>
                        <Button type="submit">
                            <FormattedMessage id="folder.save" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
