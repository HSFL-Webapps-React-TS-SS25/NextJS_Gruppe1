"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export type Todo = {
    id: string
    title: string
    description: string
    createdAt: string
    completedAt: string | null
    completed: boolean
    updatedAt: string
    folderId: string | null
    userId: string
}

export type TodoInput = {
    title: string
    description?: string
    folderId?: string | null
    userId: string
}

export function useTodos() {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    // Defensive: userId kann undefined sein, wenn Session noch nicht geladen oder nicht eingeloggt
    const userId = (session?.user as { id?: string } | undefined)?.id

    // Query für alle Todos
    const {
        data: todos = [],
        isLoading,
        error,
        isError,
    } = useQuery({
        queryKey: ["todos", userId],
        queryFn: async () => {
            if (!userId) return []
            const res = await fetch(`/api/todos?userId=${userId}`)
            if (!res.ok) throw new Error("Fehler beim Laden der Todos")
            return res.json()
        },
        enabled: !!userId,
    })

    // Mutation zum Hinzufügen eines Todos
    const addTodoMutation = useMutation({
        mutationFn: async (todo: TodoInput) => {
            if (!userId) throw new Error("Kein User eingeloggt")
            const res = await fetch("/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...todo, userId }),
            })
            if (!res.ok) throw new Error("Fehler beim Hinzufügen des Todos")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos", userId] })
        },
    })

    // Mutation zum Aktualisieren eines Todos
    const updateTodoMutation = useMutation({
        mutationFn: async (todo: Todo) => {
            if (!userId) throw new Error("Kein User eingeloggt")
            const res = await fetch("/api/todos", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...todo, userId }),
            })
            if (!res.ok) throw new Error("Fehler beim Aktualisieren des Todos")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos", userId] })
        },
    })

    // Mutation zum Löschen eines Todos
    const deleteTodoMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!userId) throw new Error("Kein User eingeloggt")
            const res = await fetch("/api/todos", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, userId }),
            })
            if (!res.ok) throw new Error("Fehler beim Löschen des Todos")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos", userId] })
        },
    })

    return {
        todos,
        isLoading,
        isError,
        error,
        addTodo: addTodoMutation.mutateAsync,
        updateTodo: updateTodoMutation.mutate,
        deleteTodo: deleteTodoMutation.mutate,
        isPendingAdd: addTodoMutation.isPending,
        isPendingUpdate: updateTodoMutation.isPending,
        isPendingDelete: deleteTodoMutation.isPending,
    }
}
