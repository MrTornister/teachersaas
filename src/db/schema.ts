import { pgTable, text, timestamp, varchar, boolean, uuid, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['user', 'admin']);
export const planTierEnum = pgEnum('plan_tier', ['free', 'pro']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'none']);
export const studentStatusEnum = pgEnum('student_status', ['active', 'archived']);
export const sessionStatusEnum = pgEnum('session_status', ['in_progress', 'pending_summary', 'closed']);
export const entryTypeEnum = pgEnum('entry_type', ['note', 'homework', 'error', 'insight']);

export const teachers = pgTable("teachers", {
    id: text("id").primaryKey(), // clerk_id
    email: text("email"),
    interfaceLanguage: varchar("interface_language", { length: 5 }).default('en'),
    createdAt: timestamp("created_at").defaultNow(),

    // Monetization
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: subscriptionStatusEnum("subscription_status").default('none'),
    planTier: planTierEnum("plan_tier").default('free'),
    role: roleEnum("role").default('user'),
});

export const students = pgTable("students", {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: text("teacher_id").references(() => teachers.id).notNull(),
    name: text("name").notNull(),
    accessToken: uuid("access_token").defaultRandom().unique(),
    status: studentStatusEnum("status").notNull().default('active'),
    preferredViewLanguage: varchar("preferred_view_language", { length: 5 }).default('pl'),
    targetLanguage: text("target_language"), // e.g. "English B2"
    privateNote: text("private_note"), // Teacher's private notes
});

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id").references(() => students.id).notNull(),
    startedAt: timestamp("started_at").defaultNow(),
    endedAt: timestamp("ended_at"),
    status: sessionStatusEnum("status").notNull().default('in_progress'),
});

export const rawEntries = pgTable("raw_entries", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").references(() => sessions.id).notNull(),
    content: text("content").notNull(),
    type: entryTypeEnum("type").notNull().default('note'),
    createdAt: timestamp("created_at").defaultNow(),
    isProcessed: boolean("is_processed").default(false),
});

export const studentCards = pgTable("student_cards", {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id").references(() => students.id).notNull(),
    version: text("version"), // Simple versioning or timestamp based
    data: jsonb("data").$type<{
        active_goal: string;
        focus_areas: string[];
        homework: string | { text: string; done: boolean };
        backlog: string[];
    }>(),
    createdAt: timestamp("created_at").defaultNow(),
});
