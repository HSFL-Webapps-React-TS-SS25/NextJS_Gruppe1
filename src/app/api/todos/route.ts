import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import type { Todo } from "../../actions/todo-actions"
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  fetchTodoById,
} from "../../actions/todo-actions"

const dataFilePath = path.join(process.cwd(), "data", "todos.json")

function getTodos(): Todo[] {
    try {
        const dirPath = path.join(process.cwd(), "data")
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
        }

        if (!fs.existsSync(dataFilePath)) {
            fs.writeFileSync(dataFilePath, JSON.stringify([]))
            return []
        }

        const data = fs.readFileSync(dataFilePath, "utf8")
        return JSON.parse(data, (key, value) => {
            if (key === "createdAt" || key === "completedAt" || key === "updatedAt") {
                return value ? new Date(value) : null
            }
            return value
        })
    } catch (error) {
        console.error("Fehler beim Lesen der Todos:", error)
        return []
    }
}

function saveTodos(todos: Todo[]): void {
    try {
        const dirPath = path.join(process.cwd(), "data")
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
        }
        fs.writeFileSync(dataFilePath, JSON.stringify(todos))
    } catch (error) {
        console.error("Fehler beim Speichern der Todos:", error)
    }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  const todos = await fetchTodos(userId)
  return NextResponse.json(todos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.userId || !body.title) return NextResponse.json({ error: "Missing data" }, { status: 400 })
  const todo = await addTodo(body)
  return NextResponse.json(todo)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  if (!body.id || !body.userId) return NextResponse.json({ error: "Missing data" }, { status: 400 })
  const todo = await updateTodo(body)
  return NextResponse.json(todo)
}

export async function DELETE(req: NextRequest) {
  const { id, userId } = await req.json()
  if (!id || !userId) return NextResponse.json({ error: "Missing data" }, { status: 400 })
  const ok = await deleteTodo(id, userId)
  return NextResponse.json({ success: ok })
}
