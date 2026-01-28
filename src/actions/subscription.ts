'use server';

import { db } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getTeacherTier() {
    const { userId } = await auth();
    if (!userId) return 'free';

    const teacher = await db.select().from(teachers).where(eq(teachers.id, userId)).then(res => res[0]);
    return teacher?.planTier || 'free';
}
