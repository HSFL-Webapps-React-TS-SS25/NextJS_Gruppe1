import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { migrate } from "drizzle-orm/libsql/migrator"
import * as schema from "../src/db/schema"

async function initDatabase() {
    console.log("🚀 Initialisiere Datenbank...")

    const client = createClient({
        url: process.env.DATABASE_URL || "file:./sqlite.db",
    })

    const db = drizzle(client, { schema })

    try {
        // Führe Migrationen aus
        console.log("📦 Führe Migrationen aus...")
        await migrate(db, { migrationsFolder: "./drizzle" })
        console.log("✅ Migrationen erfolgreich ausgeführt!")

        // Teste die Verbindung
        console.log("🔍 Teste Datenbankverbindung...")
        const folders = await db.select().from(schema.folders)
        const todos = await db.select().from(schema.todos)

        console.log(`📁 Ordner gefunden: ${folders.length}`)
        console.log(`📝 Todos gefunden: ${todos.length}`)

        console.log("✅ Datenbank erfolgreich initialisiert!")
    } catch (error) {
        console.error("❌ Fehler bei der Datenbankinitialisierung:", error)
        process.exit(1)
    }

    await client.close()
}

initDatabase()
