import { getSession, SessionPayload } from "@/lib/auth";

export async function requireUser(): Promise<SessionPayload | Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload | Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export function isResponse(x: unknown): x is Response {
  return x instanceof Response;
}
