'use server';

import { db } from "@/db";
import { studentCards } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getLatestStudentCard(studentId: string) {
    const card = await db.query.studentCards.findFirst({
        where: eq(studentCards.studentId, studentId),
        orderBy: [desc(studentCards.createdAt)]
    });

    return card;
}
