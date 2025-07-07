"use client"

import { useMemo, useState } from "react"
import type { Todo } from "../../app/actions/todo-actions"
import type { TodoFilters } from "../../components/ToDo/todo-filters"

export function useTodoFilters(todos: Todo[]) {
    const [filters, setFilters] = useState<TodoFilters>({
        search: "",
        status: "all",
        sort: "newest",
    })

    const filteredAndSortedTodos = useMemo(() => {
        let filtered = [...todos]

        // Suchfilter anwenden
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim()
            filtered = filtered.filter(
                (todo) => todo.title.toLowerCase().includes(searchTerm) || todo.description.toLowerCase().includes(searchTerm),
            )
        }

        // Statusfilter anwenden
        if (filters.status !== "all") {
            filtered = filtered.filter((todo) => {
                if (filters.status === "completed") return todo.completed
                if (filters.status === "open") return !todo.completed
                return true
            })
        }

        // Sortierung anwenden
        filtered.sort((a, b) => {
            switch (filters.sort) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case "title":
                    return a.title.localeCompare(b.title)
                case "completed":
                    // Erledigte zuerst, dann nach Datum
                    if (a.completed !== b.completed) {
                        return a.completed ? -1 : 1
                    }
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                default:
                    return 0
            }
        })

        return filtered
    }, [todos, filters])

    return {
        filters,
        setFilters,
        filteredTodos: filteredAndSortedTodos,
        totalCount: todos.length,
        filteredCount: filteredAndSortedTodos.length,
    }
}
