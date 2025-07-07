"use server"

import { db } from "../../db"
import { folders } from "../../db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type Folder = {
    id: string
    name: string
    color: string
    createdAt: Date
    updatedAt: Date
    userId: string
}

export type FolderInput = {
    name: string
    color?: string
    userId: string
}

// Hilfsfunktion zur Konvertierung der Datenbankdaten
function convertFolderFromDb(dbFolder: Record<string, unknown>): Folder {
    return {
        id: dbFolder.id as string,
        name: dbFolder.name as string,
        color: (dbFolder.color as string) || "#6366f1",
        createdAt: new Date(dbFolder.createdAt as string),
        updatedAt: new Date(dbFolder.updatedAt as string),
        userId: dbFolder.userId as string,
    }
}

// Funktion zum Abrufen aller Ordner für einen User
export async function fetchFolders(userId: string): Promise<Folder[]> {
    try {
        const result = await db.select().from(folders).where(eq(folders.userId, userId)).orderBy(folders.createdAt)
        return result.map(convertFolderFromDb)
    } catch (error) {
        console.error("Fehler beim Abrufen der Ordner:", error)
        return []
    }
}

// Funktion zum Hinzufügen eines neuen Ordners für einen User
export async function addFolder(folder: FolderInput): Promise<Folder | null> {
    try {
        const now = new Date()
        const result = await db
            .insert(folders)
            .values({
                name: folder.name,
                color: folder.color || "#6366f1",
                createdAt: now,
                updatedAt: now,
                userId: folder.userId,
                id: crypto.randomUUID(),
            })
            .returning()
        revalidatePath("/")
        return convertFolderFromDb(result[0])
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Ordners:", error)
        return null
    }
}

// Funktion zum Aktualisieren eines Ordners für einen User
export async function updateFolder(folder: Folder): Promise<Folder | null> {
    try {
        const now = new Date()
        const result = await db
            .update(folders)
            .set({
                name: folder.name,
                color: folder.color,
                updatedAt: now,
            })
            .where(and(eq(folders.id, folder.id), eq(folders.userId, folder.userId)))
            .returning()
        if (result.length === 0) {
            return null
        }
        revalidatePath("/")
        return convertFolderFromDb(result[0])
    } catch (error) {
        console.error(`Fehler beim Aktualisieren des Ordners mit ID ${folder.id}:`, error)
        return null
    }
}

// Funktion zum Löschen eines Ordners für einen User
export async function deleteFolder(id: string, userId: string): Promise<boolean> {
    try {
        await db.delete(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)))
        revalidatePath("/")
        return true
    } catch (error) {
        console.error(`Fehler beim Löschen des Ordners mit ID ${id}:`, error)
        return false
    }
}
