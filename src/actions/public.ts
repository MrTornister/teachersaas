'use server';

import { db } from "@/db";
import { students, studentCards } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getStudentPublicData(token: string) {
    // Find student by token
    const student = await db.query.students.findFirst({
        where: eq(students.accessToken, token)
    });

    if (!student) return null;

    // Get latest card
    const card = await db.query.studentCards.findFirst({
        where: eq(studentCards.studentId, student.id),
        orderBy: [desc(studentCards.createdAt)]
    });

    return { student, card };
}
