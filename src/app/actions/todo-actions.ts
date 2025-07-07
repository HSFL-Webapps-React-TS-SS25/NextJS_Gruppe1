"use server"

import { db } from "../../db"
import { todos } from "../../db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export type Todo = {
    id: string
    title: string
    description: string
    createdAt: Date
    completedAt: Date | null
    completed: boolean
    updatedAt: Date
    folderId: string | null
    userId: string
}

export type TodoInput = {
    title: string
    description?: string
    folderId?: string | null
    userId: string
}

// Hilfsfunktion zur Konvertierung der Datenbankdaten
function convertTodoFromDb(dbTodo: Record<string, unknown>): Todo {
    return {
        id: dbTodo.id as string,
        title: dbTodo.title as string,
        description: (dbTodo.description as string) || "",
        createdAt: new Date(dbTodo.createdAt as string),
        completedAt: dbTodo.completedAt ? new Date(dbTodo.completedAt as string) : null,
        updatedAt: new Date(dbTodo.updatedAt as string),
        completed: Boolean(dbTodo.completed),
        folderId: (dbTodo.folderId as string) || null,
        userId: dbTodo.userId as string,
    }
}

// Funktion zum Abrufen aller Todos für einen User
export async function fetchTodos(userId: string): Promise<Todo[]> {
    try {
        const result = await db.select().from(todos).where(eq(todos.userId, userId)).orderBy(todos.createdAt)
        return result.map(convertTodoFromDb)
    } catch (error) {
        console.error("Fehler beim Abrufen der Todos:", error)
        return []
    }
}

// Funktion zum Abrufen eines einzelnen Todos für einen User
export async function fetchTodoById(id: string, userId: string): Promise<Todo | null> {
    try {
        const result = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId))).limit(1)
        if (result.length === 0) return null
        return convertTodoFromDb(result[0])
    } catch (error) {
        console.error(`Fehler beim Abrufen des Todos mit ID ${id}:`, error)
        return null
    }
}

// Funktion zum Hinzufügen eines neuen Todos für einen User
export async function addTodo(todo: TodoInput): Promise<Todo | null> {
    try {
        const now = new Date()
        const result = await db
            .insert(todos)
            .values({
                id: randomUUID(),
                title: todo.title,
                description: todo.description || "",
                folderId: todo.folderId || null,
                createdAt: now,
                updatedAt: now,
                userId: todo.userId,
                completed: false,
            })
            .returning()
        revalidatePath("/")
        return convertTodoFromDb(result[0])
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Todos:", error)
        return null
    }
}

// Funktion zum Aktualisieren eines Todos für einen User
export async function updateTodo(todo: Todo): Promise<Todo | null> {
    try {
        const now = new Date()
        const result = await db
            .update(todos)
            .set({
                title: todo.title,
                description: todo.description,
                completed: todo.completed,
                completedAt: todo.completedAt,
                folderId: todo.folderId,
                updatedAt: now,
            })
            .where(and(eq(todos.id, todo.id), eq(todos.userId, todo.userId)))
            .returning()
        if (result.length === 0) {
            return null
        }
        revalidatePath("/")
        revalidatePath(`/details/${todo.id}`)
        return convertTodoFromDb(result[0])
    } catch (error) {
        console.error(`Fehler beim Aktualisieren des Todos mit ID ${todo.id}:`, error)
        return null
    }
}

// Funktion zum Löschen eines Todos für einen User
export async function deleteTodo(id: string, userId: string): Promise<boolean> {
    try {
        await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)))
        revalidatePath("/")
        return true
    } catch (error) {
        console.error(`Fehler beim Löschen des Todos mit ID ${id}:`, error)
        return false
    }
}

// Funktion zum Umschalten des Status eines Todos für einen User
export async function toggleTodoStatus(todo: Todo): Promise<Todo | null> {
    try {
        const now = new Date()
        const newCompleted = !todo.completed
        const result = await db
            .update(todos)
            .set({
                completed: newCompleted,
                completedAt: newCompleted ? now : null,
                updatedAt: now,
            })
            .where(and(eq(todos.id, todo.id), eq(todos.userId, todo.userId)))
            .returning()
        if (result.length === 0) {
            return null
        }
        revalidatePath("/")
        revalidatePath(`/details/${todo.id}`)
        return convertTodoFromDb(result[0])
    } catch (error) {
        console.error(`Fehler beim Umschalten des Status für Todo mit ID ${todo.id}:`, error)
        return null
    }
}

// Funktion zum Verschieben eines Todos in einen Ordner für einen User
export async function moveTodoToFolder(todoId: string, folderId: string | null, userId: string): Promise<Todo | null> {
    try {
        console.log(`Verschiebe Todo ${todoId} in Ordner ${folderId}`)
        const now = new Date()
        const result = await db
            .update(todos)
            .set({
                folderId: folderId,
                updatedAt: now,
            })
            .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
            .returning()
        if (result.length === 0) {
            console.error(`Todo mit ID ${todoId} nicht gefunden`)
            return null
        }
        // Revalidiere alle relevanten Pfade
        revalidatePath("/")
        console.log(`Todo erfolgreich verschoben:`, result[0])
        return convertTodoFromDb(result[0])
    } catch (error) {
        console.error(`Fehler beim Verschieben des Todos mit ID ${todoId}:`, error)
        return null
    }
}
