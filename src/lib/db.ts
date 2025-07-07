import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"
import { join } from "path"
import fs from "fs"
import type { Todo } from "../app/actions/todo-actions"

// Definiere den Typ für die Datenbank
type Schema = {
    todos: Todo[]
}

// Singleton-Instanz der Datenbank
let db: Low<Schema> | null = null

export async function getDb(): Promise<Low<Schema>> {
    if (db) return db

    // Stelle sicher, dass das Datenverzeichnis existiert
    const dbDir = join(process.cwd(), "data")
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
    }

    const file = join(dbDir, "db.json")

    // Erstelle eine leere Datenbankdatei, wenn sie nicht existiert
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify({ todos: [] }), "utf-8")
    }

    const adapter = new JSONFile<Schema>(file)

    // Initialisiere die Datenbank mit dem Adapter und den Standarddaten
    // Hier fügen wir das zweite Argument hinzu, das in der neueren Version von lowdb erforderlich ist
    db = new Low<Schema>(adapter, { todos: [] })

    try {
        await db.read()
        // Initialisiere die Datenbank, wenn sie leer ist
        db.data ||= { todos: [] }
    } catch (error) {
        console.error("Fehler beim Lesen der Datenbank:", error)
        // Fallback: Initialisiere mit leeren Daten
        db.data = { todos: [] }
    }

    return db
}

// Hilfsfunktion zum Speichern der Datenbank
export async function saveDb(): Promise<void> {
    if (!db) {
        throw new Error("Datenbank wurde nicht initialisiert")
    }

    try {
        await db.write()
    } catch (error) {
        console.error("Fehler beim Speichern der Datenbank:", error)
        throw error
    }
}

// Hilfsfunktionen für CRUD-Operationen
export async function getAllTodos(): Promise<Todo[]> {
    const database = await getDb()
    return database.data.todos.map((todo) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
    }))
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
    const database = await getDb()
    const todo = database.data.todos.find((todo) => todo.id === id)

    if (!todo) return undefined

    return {
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
    }
}

export async function createTodo(todo: Omit<Todo, "id" | "createdAt" | "completedAt" | "completed">): Promise<Todo> {
    const database = await getDb()

    const newTodo: Todo = {
        id: Date.now().toString(),
        title: todo.title,
        description: todo.description,
        createdAt: new Date(),
        completedAt: null,
        completed: false,
    }

    database.data.todos.push(newTodo)
    await saveDb()

    return newTodo
}

export async function updateTodoById(id: string, updates: Partial<Todo>): Promise<Todo | undefined> {
    const database = await getDb()
    const index = database.data.todos.findIndex((todo) => todo.id === id)

    if (index === -1) return undefined

    const updatedTodo = {
        ...database.data.todos[index],
        ...updates,
        // Stelle sicher, dass die Datumsfelder korrekt sind
        createdAt: database.data.todos[index].createdAt,
        completedAt:
            updates.completed && !database.data.todos[index].completed
                ? new Date()
                : updates.completed === false
                    ? null
                    : database.data.todos[index].completedAt,
    }

    database.data.todos[index] = updatedTodo
    await saveDb()

    return {
        ...updatedTodo,
        createdAt: new Date(updatedTodo.createdAt),
        completedAt: updatedTodo.completedAt ? new Date(updatedTodo.completedAt) : null,
    }
}

export async function deleteTodoById(id: string): Promise<boolean> {
    const database = await getDb()
    const initialLength = database.data.todos.length

    database.data.todos = database.data.todos.filter((todo) => todo.id !== id)

    if (database.data.todos.length === initialLength) {
        return false
    }

    await saveDb()
    return true
}
