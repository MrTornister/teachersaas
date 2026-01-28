import { startSession, getSessionEntries } from '@/actions/lesson';
import { LessonManager } from '@/components/lesson/LessonManager';

export default async function LessonPage({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = await params;

    // Start or resume session
    const session = await startSession(studentId);
    const entries = await getSessionEntries(session.id);

    // Transform dates for client component serialization
    const serializedEntries = entries.map(e => ({
        ...e,
        content: e.content,
        type: e.type,
        createdAt: e.createdAt || new Date(), // Fallback if null
    }));

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Lesson Mode</h1>
                {/* Future: Student Snapshot Header */}
            </div>

            <LessonManager
                sessionId={session.id}
                initialEntries={serializedEntries}
            />
        </div>
    );
}
