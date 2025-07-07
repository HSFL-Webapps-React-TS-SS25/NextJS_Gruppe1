import { db } from "../../../db/index";
import { users } from "../../../db/schema";
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const email = req.body.email.toLowerCase().trim();
  const { password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Alle Felder sind erforderlich" });
  }
  // Prüfe, ob User schon existiert (case-insensitive)
  const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, email) });
  if (existing) {
    return res.status(400).json({ error: "E-Mail ist bereits registriert." });
  }
  // Passwort hashen
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date();
  await db.insert(users).values({
    id: randomUUID(),
    name,
    email,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });
  return res.status(201).json({ ok: true });
} 