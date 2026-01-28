'use server';

import { db } from "@/db";
import { teachers, students } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function isAdmin() {
    const { userId } = await auth();
    if (!userId) return false;

    const teacher = await db.select().from(teachers).where(eq(teachers.id, userId)).then(res => res[0]);
    return teacher?.role === 'admin';
}

export async function getAllTeachers() {
    const admin = await isAdmin();
    if (!admin) throw new Error("Unauthorized");

    // Get all teachers with student count
    const teacherList = await db
        .select({
            id: teachers.id,
            email: teachers.email,
            planTier: teachers.planTier,
            subscriptionStatus: teachers.subscriptionStatus,
            createdAt: teachers.createdAt,
            studentCount: sql<number>`(SELECT COUNT(*) FROM ${students} WHERE ${students.teacherId} = ${teachers.id} AND ${students.status} = 'active')`,
        })
        .from(teachers);

    return teacherList;
}

export async function updateTeacherTier(teacherId: string, tier: 'free' | 'pro') {
    const admin = await isAdmin();
    if (!admin) throw new Error("Unauthorized");

    await db.update(teachers)
        .set({ planTier: tier })
        .where(eq(teachers.id, teacherId));

    revalidatePath('/admin');
}
