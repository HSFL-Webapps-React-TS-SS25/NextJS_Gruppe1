import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { sql } from "drizzle-orm"

async function setupDatabase() {
    console.log("🚀 Erstelle Datenbanktabellen...")

    const client = createClient({
        url: process.env.DATABASE_URL || "file:./sqlite.db",
    })

    const db = drizzle(client)

    try {
        // Erstelle folders Tabelle
        await db.run(sql`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#6366f1' NOT NULL,
        created_at REAL NOT NULL,
        updated_at REAL NOT NULL
      )
    `)

        // Erstelle todos Tabelle
        await db.run(sql`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '' NOT NULL,
        completed INTEGER DEFAULT 0 NOT NULL,
        folder_id TEXT,
        created_at REAL NOT NULL,
        completed_at REAL,
        updated_at REAL NOT NULL,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
      )
    `)

        console.log("✅ Tabellen erfolgreich erstellt!")

        // Teste die Tabellen
        const foldersResult = await db.run(sql`SELECT COUNT(*) as count FROM folders`)
        const todosResult = await db.run(sql`SELECT COUNT(*) as count FROM todos`)

        console.log("📊 Datenbank bereit!")
    } catch (error) {
        console.error("❌ Fehler beim Erstellen der Tabellen:", error)
        process.exit(1)
    }

    await client.close()
}

setupDatabase()
