import { startSession, getSessionEntries } from '@/actions/lesson';
import { getLatestStudentCard } from '@/actions/studentCard';
import { LessonManager } from '@/components/lesson/LessonManager';
import { StudentSnapshot } from '@/components/lesson/StudentSnapshot';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function LessonPage({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = await params;

    // Get student info
    const student = await db.query.students.findFirst({
        where: eq(students.id, studentId)
    });

    if (!student) {
        return <div>Student not found</div>;
    }

    // Start or resume session
    let session;
    try {
        session = await startSession(studentId);
    } catch (error) {
        if (error instanceof Error && error.message === 'PENDING_SUMMARY') {
            // Redirect to summary page
            return (
                <div className="container mx-auto max-w-2xl py-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Summary Required</h2>
                    <p className="mb-4">Please complete the summary for the previous lesson before starting a new one.</p>
                    <Link href={`/lesson/${studentId}/summary`}>
                        <Button>Go to Summary</Button>
                    </Link>
                </div>
            );
        }
        throw error;
    }

    const entries = await getSessionEntries(session.id);
    const card = await getLatestStudentCard(studentId);

    // Transform dates for client component serialization
    const serializedEntries = entries.map(e => ({
        ...e,
        content: e.content,
        type: e.type,
        createdAt: e.createdAt || new Date(), // Fallback if null
    }));

    const cardData = card?.data as {
        active_goal: string;
        focus_areas: string[];
        homework: string | { text: string; done: boolean };
        backlog: string[];
    } | null;

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <StudentSnapshot
                studentName={student.name}
                studentContext={{
                    targetLanguage: student.targetLanguage,
                    privateNote: student.privateNote
                }}
                card={cardData}
            />

            <LessonManager
                sessionId={session.id}
                initialEntries={serializedEntries}
            />
        </div>
    );
}
