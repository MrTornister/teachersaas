'use server';

import { db } from "@/db";
import { studentCards, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getStudentPublicData(token: string) {
    // Find student by token
    const student = await db.query.students.findFirst({
        where: eq(students.accessToken, token)
    });

    if (!student) return null;

    // Find latest card
    const card = await db.query.studentCards.findFirst({
        where: eq(studentCards.studentId, student.id),
        orderBy: [desc(studentCards.createdAt)]
    });

    return { student, card };
}

export async function toggleHomework(token: string) {
    // 1. Find student by token
    const student = await db.query.students.findFirst({
        where: eq(students.accessToken, token)
    });

    if (!student) throw new Error("Invalid token");

    // 2. Find latest card
    const card = await db.query.studentCards.findFirst({
        where: eq(studentCards.studentId, student.id),
        orderBy: [desc(studentCards.createdAt)]
    });

    if (!card) throw new Error("No card found");

    // 3. Update homework status
    const currentData = card.data as any;
    let newHomework = currentData.homework;

    if (typeof newHomework === 'string') {
        newHomework = { text: newHomework, done: true }; // Convert string to object and mark done
    } else if (newHomework && typeof newHomework === 'object') {
        newHomework = { ...newHomework, done: !newHomework.done }; // Toggle
    }

    await db.update(studentCards)
        .set({
            data: {
                ...currentData,
                homework: newHomework
            }
        })
        .where(eq(studentCards.id, card.id));

    revalidatePath(`/s/${token}`);
    revalidatePath(`/dashboard`); // Teacher should see it too? Maybe in future.
}
