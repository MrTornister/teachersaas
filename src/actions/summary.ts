'use server';

import { db } from "@/db";
import { sessions, rawEntries, studentCards, students } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';

async function getTeacher() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

export async function getSessionForSummary(studentId: string) {
    const teacherId = await getTeacher();

    // Get Pending Summary session or In Progress
    const session = await db.query.sessions.findFirst({
        where: and(
            eq(sessions.studentId, studentId),
        ),
        orderBy: [desc(sessions.startedAt)],
        with: {
            // We need raw entries for this session
            // Note: Drizzle query builder relation setup might be missing in schema, 
            // using manual select if relations aren't fully set up or just select rawEntries separately.
        }
    });

    if (!session) return null;

    const entries = await db.select().from(rawEntries)
        .where(eq(rawEntries.sessionId, session.id));

    return { session, entries };
}

export async function commitSummary(studentId: string, data: {
    active_goal: string;
    focus_areas: string[];
    homework: string;
    backlog: string[];
}) {
    const teacherId = await getTeacher();

    // 1. Create Student Card Snapshot
    await db.insert(studentCards).values({
        studentId,
        version: new Date().toISOString(), // Simple versioning
        data: {
            ...data,
            homework: { text: data.homework, done: false }
        }
    });

    // 2. Close the session (if valid)
    const session = await db.query.sessions.findFirst({
        where: and(eq(sessions.studentId, studentId)),
        orderBy: [desc(sessions.startedAt)]
    });

    if (session) {
        await db.update(sessions)
            .set({ status: 'closed', endedAt: new Date() })
            .where(eq(sessions.id, session.id));
    }

    revalidatePath('/dashboard');
    redirect('/dashboard');
}
