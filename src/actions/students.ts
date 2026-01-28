'use server';

import { db } from "@/db";
import { students, teachers } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
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
    return db.select().from(students)
        .where(and(eq(students.teacherId, teacherId), eq(students.status, 'active')));
}

export async function addStudent(formData: FormData) {
    const teacherId = await getTeacher();
    await ensureTeacherExists();

    const name = formData.get("name") as string;

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
