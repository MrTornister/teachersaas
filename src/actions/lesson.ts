'use server';

import { db } from "@/db";
import { sessions, rawEntries, students } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Ensure user is authorized
async function getTeacher() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

export async function getActiveSession(studentId: string) {
    const teacherId = await getTeacher();

    // Verify student belongs to teacher
    const student = await db.query.students.findFirst({
        where: and(eq(students.id, studentId), eq(students.teacherId, teacherId))
    });

    if (!student) throw new Error("Student not found");

    // Find active session
    const session = await db.query.sessions.findFirst({
        where: and(
            eq(sessions.studentId, studentId),
            eq(sessions.status, 'in_progress')
        ),
        orderBy: [desc(sessions.startedAt)]
    });

    return session;
}

export async function startSession(studentId: string) {
    const teacherId = await getTeacher();

    // Verify student belongs to teacher
    const student = await db.query.students.findFirst({
        where: and(eq(students.id, studentId), eq(students.teacherId, teacherId))
    });
    if (!student) throw new Error("Student not found");

    // Check if there is already an active session
    const existing = await getActiveSession(studentId);
    if (existing) return existing;

    const [newSession] = await db.insert(sessions).values({
        studentId,
        status: 'in_progress'
    }).returning();

    revalidatePath(`/lesson/${studentId}`);
    return newSession;
}

export async function addEntry(sessionId: string, content: string, type: 'note' | 'homework' | 'error' | 'insight' = 'note') {
    await getTeacher(); // just auth check

    await db.insert(rawEntries).values({
        sessionId,
        content,
        type
    });

    revalidatePath(`/lesson`);
}

export async function getSessionEntries(sessionId: string) {
    return db.select().from(rawEntries)
        .where(eq(rawEntries.sessionId, sessionId))
        .orderBy(desc(rawEntries.createdAt));
}
