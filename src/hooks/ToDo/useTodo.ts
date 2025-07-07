"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchTodoById, updateTodo, toggleTodoStatus } from "../../app/actions/todo-actions"
import type { Todo } from "../../app/actions/todo-actions"
import { useSession } from "next-auth/react"

export function useTodo(id: string) {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    const userId = session?.user?.id

    // Query für ein einzelnes Todo
    const todoQuery = useQuery({
        queryKey: ["todo", id, userId],
        queryFn: () => (id && userId ? fetchTodoById(id, userId) : Promise.resolve(null)),
        enabled: !!id && !!userId,
    })

    // Mutation zum Aktualisieren eines Todos
    const updateTodoMutation = useMutation({
        mutationFn: (updatedTodo: Todo) => userId ? updateTodo({ ...updatedTodo, userId }) : Promise.reject("Kein User eingeloggt"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todo", id, userId] })
            queryClient.invalidateQueries({ queryKey: ["todos", userId] })
        },
    })

    // Mutation zum Umschalten des Status eines Todos
    const toggleTodoStatusMutation = useMutation({
        mutationFn: (todo: Todo) => userId ? toggleTodoStatus({ ...todo, userId }) : Promise.reject("Kein User eingeloggt"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todo", id, userId] })
            queryClient.invalidateQueries({ queryKey: ["todos", userId] })
        },
    })

    return {
        todo: todoQuery.data,
        isLoading: todoQuery.isLoading,
        isError: todoQuery.isError,
        error: todoQuery.error,
        updateTodo: updateTodoMutation.mutate,
        toggleStatus: toggleTodoStatusMutation.mutate,
        isPendingUpdate: updateTodoMutation.isPending,
        isPendingToggle: toggleTodoStatusMutation.isPending,
    }
}
