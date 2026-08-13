import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema, validate } from "@/lib/validation";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const { success, data, error } = validate(registerSchema, body);
  if (!success) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(data.email);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  try {
    const passwordHash = await hashPassword(data.password);
    const result = db
      .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
      .run(data.name, data.email, passwordHash, data.role);

    const user = { id: result.lastInsertRowid, name: data.name, role: data.role };
    await setSessionCookie(user);

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: data.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
  }
}
