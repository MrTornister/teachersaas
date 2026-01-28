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

    // CHECK: Does student have a pending summary?
    const latestSession = await db.query.sessions.findFirst({
        where: eq(sessions.studentId, studentId),
        orderBy: [desc(sessions.startedAt)]
    });

    if (latestSession?.status === 'pending_summary') {
        throw new Error("PENDING_SUMMARY");
    }

    const [newSession] = await db.insert(sessions).values({
        studentId,
        status: 'in_progress'
    }).returning();

    return newSession;
}

export async function addEntry(sessionId: string, content: string, type: 'note' | 'homework' | 'error' | 'insight' = 'note') {
    await getTeacher(); // just auth check

    await db.insert(rawEntries).values({
        sessionId,
        content,
        type
    });
}

export async function getSessionEntries(sessionId: string) {
    return db.select().from(rawEntries)
        .where(eq(rawEntries.sessionId, sessionId))
        .orderBy(desc(rawEntries.createdAt));
}

export async function stopSession(sessionId: string) {
    await getTeacher(); // auth check

    await db.update(sessions)
        .set({
            status: 'pending_summary',
            endedAt: new Date()
        })
        .where(eq(sessions.id, sessionId));

    // No revalidate needed as we redirect immediately usually, but good practice
    revalidatePath('/dashboard');
}
