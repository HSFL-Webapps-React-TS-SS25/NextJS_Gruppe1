"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchFolders, addFolder, updateFolder, deleteFolder } from "../app/actions/folder-actions"
import type { FolderInput, Folder } from "../app/actions/folder-actions"
import { useSession } from "next-auth/react"

export function useFolders() {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    const userId = session?.user?.id

    // Query für alle Ordner
    const foldersQuery = useQuery({
        queryKey: ["folders", userId],
        queryFn: () => userId ? fetchFolders(userId) : Promise.resolve([]),
        enabled: !!userId,
    })

    // Mutation zum Hinzufügen eines Ordners
    const addFolderMutation = useMutation({
        mutationFn: (newFolder: FolderInput) => userId ? addFolder({ ...newFolder, userId }) : Promise.reject("Kein User eingeloggt"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders", userId] })
        },
    })

    // Mutation zum Aktualisieren eines Ordners
    const updateFolderMutation = useMutation({
        mutationFn: (folder: Folder) => userId ? updateFolder({ ...folder, userId }) : Promise.reject("Kein User eingeloggt"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders", userId] })
        },
    })

    // Mutation zum Löschen eines Ordners
    const deleteFolderMutation = useMutation({
        mutationFn: (id: string) => userId ? deleteFolder(id, userId) : Promise.reject("Kein User eingeloggt"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders", userId] })
            queryClient.invalidateQueries({ queryKey: ["todos", userId] })
        },
    })

    return {
        folders: foldersQuery.data || [],
        isLoading: foldersQuery.isLoading,
        isError: foldersQuery.isError,
        error: foldersQuery.error,
        addFolder: addFolderMutation.mutate,
        updateFolder: updateFolderMutation.mutate,
        deleteFolder: deleteFolderMutation.mutate,
        isPendingAdd: addFolderMutation.isPending,
        isPendingUpdate: updateFolderMutation.isPending,
        isPendingDelete: deleteFolderMutation.isPending,
    }
}
