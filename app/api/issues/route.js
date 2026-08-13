import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { issueCreateSchema, validate, CATEGORIES, STATUSES } from "@/lib/validation";

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const mine = searchParams.get("mine");

  if (status && !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }
  if (category && !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category filter" }, { status: 400 });
  }

  let query = `
    SELECT issues.*, users.name AS reporter_name
    FROM issues
    JOIN users ON users.id = issues.reported_by
    WHERE 1 = 1
  `;
  const params = [];

  if (status) {
    query += " AND issues.status = ?";
    params.push(status);
  }
  if (category) {
    query += " AND issues.category = ?";
    params.push(category);
  }
  if (mine === "1") {
    query += " AND issues.reported_by = ?";
    params.push(session.id);
  }

  query += " ORDER BY issues.created_at DESC";

  try {
    const issues = db.prepare(query).all(...params);
    return NextResponse.json({ issues });
  } catch (err) {
    console.error("List issues error:", err);
    return NextResponse.json({ error: "Could not load issues" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in to report an issue" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const { success, data, error } = validate(issueCreateSchema, body);
  if (!success) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO issues (title, description, category, location, photo_url, status, reported_by)
         VALUES (?, ?, ?, ?, ?, 'reported', ?)`
      )
      .run(data.title, data.description, data.category, data.location, data.photo_url, session.id);

    const issue = db
      .prepare(
        `SELECT issues.*, users.name AS reporter_name
         FROM issues JOIN users ON users.id = issues.reported_by
         WHERE issues.id = ?`
      )
      .get(result.lastInsertRowid);

    return NextResponse.json({ issue }, { status: 201 });
  } catch (err) {
    console.error("Create issue error:", err);
    return NextResponse.json({ error: "Could not submit issue. Please try again." }, { status: 500 });
  }
}
