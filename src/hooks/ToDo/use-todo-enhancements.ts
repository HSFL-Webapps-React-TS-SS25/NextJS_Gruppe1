"use client"

import { useState, useEffect } from "react"
import type { Todo } from "../../app/actions/todo-actions"

export type Priority = "low" | "medium" | "high" | "urgent"

export interface TodoEnhancement {
    id: string
    priority: Priority
    dueDate?: Date
}

interface StoredTodoEnhancement {
    id: string
    priority: Priority
    dueDate?: string // Als String gespeichert
}

const STORAGE_KEY = "todo-enhancements"

export function useTodoEnhancements() {
    const [enhancements, setEnhancements] = useState<Record<string, TodoEnhancement>>({})

    // Lade Enhancements aus localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed: Record<string, StoredTodoEnhancement> = JSON.parse(stored)
                // Konvertiere Datum-Strings zurück zu Date-Objekten
                const converted = Object.fromEntries(
                    Object.entries(parsed).map(([id, enhancement]) => [
                        id,
                        {
                            id: enhancement.id,
                            priority: enhancement.priority,
                            dueDate: enhancement.dueDate ? new Date(enhancement.dueDate) : undefined,
                        } as TodoEnhancement,
                    ]),
                )
                setEnhancements(converted)
            }
        } catch (error) {
            console.error("Fehler beim Laden der Todo-Enhancements:", error)
        }
    }, [])

    // Speichere Enhancements in localStorage
    const saveEnhancements = (newEnhancements: Record<string, TodoEnhancement>) => {
        try {
            // Konvertiere Date-Objekte zu Strings für die Speicherung
            const toStore = Object.fromEntries(
                Object.entries(newEnhancements).map(([id, enhancement]) => [
                    id,
                    {
                        id: enhancement.id,
                        priority: enhancement.priority,
                        dueDate: enhancement.dueDate ? enhancement.dueDate.toISOString() : undefined,
                    } as StoredTodoEnhancement,
                ]),
            )
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
            setEnhancements(newEnhancements)
        } catch (error) {
            console.error("Fehler beim Speichern der Todo-Enhancements:", error)
        }
    }

    const updateTodoEnhancement = (todoId: string, updates: Partial<Pick<TodoEnhancement, "priority" | "dueDate">>) => {
        const currentEnhancement = enhancements[todoId] || {
            id: todoId,
            priority: "medium" as Priority,
        }

        const newEnhancement: TodoEnhancement = {
            ...currentEnhancement,
            ...updates,
        }

        const newEnhancements = {
            ...enhancements,
            [todoId]: newEnhancement,
        }

        saveEnhancements(newEnhancements)
    }

    const getTodoEnhancement = (todoId: string): TodoEnhancement => {
        return enhancements[todoId] || { id: todoId, priority: "medium" }
    }

    // Sortiere Todos nach Priorität und Fälligkeitsdatum
    const sortTodosByPriority = (todos: Todo[]): Todo[] => {
        const priorityOrder: Record<Priority, number> = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
        }

        return [...todos].sort((a, b) => {
            const aEnhancement = getTodoEnhancement(a.id)
            const bEnhancement = getTodoEnhancement(b.id)

            // Erst nach Fälligkeitsdatum sortieren (überfällige und heute fällige zuerst)
            const now = new Date()
            const aOverdue = aEnhancement.dueDate && aEnhancement.dueDate < now
            const bOverdue = bEnhancement.dueDate && bEnhancement.dueDate < now

            if (aOverdue && !bOverdue) return -1
            if (!aOverdue && bOverdue) return 1

            // Dann nach Priorität sortieren
            const priorityDiff = priorityOrder[aEnhancement.priority] - priorityOrder[bEnhancement.priority]
            if (priorityDiff !== 0) return priorityDiff

            // Dann nach Fälligkeitsdatum (frühere Termine zuerst)
            if (aEnhancement.dueDate && bEnhancement.dueDate) {
                return aEnhancement.dueDate.getTime() - bEnhancement.dueDate.getTime()
            }
            if (aEnhancement.dueDate) return -1
            if (bEnhancement.dueDate) return 1

            // Zuletzt nach Erstellungsdatum
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }

    return {
        enhancements,
        updateTodoEnhancement,
        getTodoEnhancement,
        sortTodosByPriority,
    }
}
