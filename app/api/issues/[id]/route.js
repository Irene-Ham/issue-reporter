import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { statusUpdateSchema, validate } from "@/lib/validation";

// Allowed forward transitions for the issue status state machine.
// Kept intentionally simple and linear per the project's activity diagram.
const ALLOWED_TRANSITIONS = {
  reported: ["in_progress"],
  in_progress: ["resolved"],
  resolved: [],
};

async function getIssueId(context) {
  const params = await context.params;
  const idNum = Number(params.id);
  return Number.isInteger(idNum) && idNum > 0 ? idNum : null;
}

// GET /api/issues/:id — issue detail plus its status history
export async function GET(request, context) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const id = await getIssueId(context);
  if (!id) {
    return NextResponse.json({ error: "Invalid issue id" }, { status: 400 });
  }

  const issue = db
    .prepare(
      `SELECT issues.*, users.name AS reporter_name
       FROM issues JOIN users ON users.id = issues.reported_by
       WHERE issues.id = ?`
    )
    .get(id);

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const history = db
    .prepare(
      `SELECT status_updates.*, users.name AS updated_by_name
       FROM status_updates JOIN users ON users.id = status_updates.updated_by
       WHERE issue_id = ?
       ORDER BY timestamp ASC`
    )
    .all(id);

  return NextResponse.json({ issue, history });
}

// PATCH /api/issues/:id — staff-only status transition, logged to status_updates.
export async function PATCH(request, context) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }
  if (session.role !== "staff") {
    return NextResponse.json({ error: "Only staff can update issue status" }, { status: 403 });
  }

  const id = await getIssueId(context);
  if (!id) {
    return NextResponse.json({ error: "Invalid issue id" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const { success, data, error } = validate(statusUpdateSchema, body);
  if (!success) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(id);
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const allowedNext = ALLOWED_TRANSITIONS[issue.status] || [];
  if (!allowedNext.includes(data.new_status)) {
    return NextResponse.json(
      { error: `Cannot move an issue from "${issue.status}" to "${data.new_status}"` },
      { status: 409 }
    );
  }

  const tx = db.transaction(() => {
    db.prepare("UPDATE issues SET status = ? WHERE id = ?").run(data.new_status, id);
    db.prepare(
      `INSERT INTO status_updates (issue_id, old_status, new_status, note, updated_by)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, issue.status, data.new_status, data.note, session.id);
  });

  try {
    tx();
  } catch (err) {
    console.error("Status update error:", err);
    return NextResponse.json({ error: "Could not update status. Please try again." }, { status: 500 });
  }

  const updatedIssue = db
    .prepare(
      `SELECT issues.*, users.name AS reporter_name
       FROM issues JOIN users ON users.id = issues.reported_by
       WHERE issues.id = ?`
    )
    .get(id);

  return NextResponse.json({ issue: updatedIssue });
}