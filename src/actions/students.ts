'use server';

import { db } from "@/db";
import { students, teachers, sessions, studentCards } from "@/db/schema";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Helper to get authenticated teacher
async function getTeacher() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

// Ensure teacher exists in our DB (sync with Clerk)
async function ensureTeacherExists() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await db.select().from(teachers).where(eq(teachers.id, user.id));
    if (existing.length === 0) {
        await db.insert(teachers).values({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
        });
    }
}

export async function getStudents() {
    const teacherId = await getTeacher();
    const studentList = await db.select().from(students)
        .where(and(eq(students.teacherId, teacherId), eq(students.status, 'active')));

    // For each student, check status and get latest snapshot
    const studentsWithStatus = await Promise.all(
        studentList.map(async (student) => {
            // Get latest session for status
            const latestSession = await db.query.sessions.findFirst({
                where: eq(sessions.studentId, student.id),
                orderBy: [desc(sessions.startedAt)]
            });

            // Get latest card for snapshot data
            const latestCard = await db.query.studentCards.findFirst({
                where: eq(studentCards.studentId, student.id),
                orderBy: [desc(studentCards.createdAt)]
            });

            const hasPendingSummary = latestSession?.status === 'pending_summary';
            const isLessonInProgress = latestSession?.status === 'in_progress';
            const cardData = latestCard?.data as { active_goal?: string; homework?: string | { text: string; done: boolean }; focus_areas?: string[] } | null;

            return {
                ...student,
                hasPendingSummary,
                isLessonInProgress,
                latestCard: cardData ? {
                    active_goal: cardData.active_goal,
                    homework: cardData.homework,
                    focus_areas: cardData.focus_areas || []
                } : null,
                lastLessonDate: latestSession?.startedAt || null
            };
        })
    );

    return studentsWithStatus;
}

export async function addStudent(formData: FormData) {
    const teacherId = await getTeacher();
    await ensureTeacherExists();

    const name = formData.get("name") as string;
    const targetLanguage = formData.get("targetLanguage") as string;
    const privateNote = formData.get("privateNote") as string;

    // Check limit for free tier
    const teacherRecord = await db.select().from(teachers).where(eq(teachers.id, teacherId)).then(res => res[0]);

    if (teacherRecord?.planTier === 'free') {
        const studentCount = await db.select({ count: count() }).from(students).where(and(eq(students.teacherId, teacherId), eq(students.status, 'active'))).then(res => res[0].count);
        if (studentCount >= 2) {
            throw new Error("LIMIT_REACHED");
        }
    }

    await db.insert(students).values({
        teacherId,
        name,
        targetLanguage,
        privateNote,
    });

    revalidatePath('/dashboard');
}

export async function archiveStudent(studentId: string) {
    const teacherId = await getTeacher();
    await db.update(students)
        .set({ status: 'archived' })
        .where(and(eq(students.id, studentId), eq(students.teacherId, teacherId)));

    revalidatePath('/dashboard');
}

export async function updateStudent(studentId: string, name: string, targetLanguage?: string, privateNote?: string) {
    const teacherId = await getTeacher();

    await db.update(students)
        .set({
            name,
            targetLanguage,
            privateNote
        })
        .where(and(eq(students.id, studentId), eq(students.teacherId, teacherId)));

    revalidatePath('/dashboard');
}
