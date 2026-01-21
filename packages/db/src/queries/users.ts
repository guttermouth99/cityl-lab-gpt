import { eq } from "drizzle-orm";
import { db } from "../client";
import { users } from "../schema/users";

export function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
}

export async function updateUserRole(
  userId: string,
  role: "user" | "customer" | "admin"
) {
  const [updated] = await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}
