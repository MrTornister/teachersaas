import { getSessionForSummary } from '@/actions/summary';
import { SummaryBoard } from '@/components/summary/SummaryBoard';
import { redirect } from 'next/navigation';

export default async function SummaryPage({ params }: { params: Promise<{ studentId: string }> }) {
    const { studentId } = await params;

    const data = await getSessionForSummary(studentId);

    if (!data) {
        redirect(`/dashboard`); // No session to summarize
    }

    return (
        <div className="container mx-auto p-6 h-screen">
            <h1 className="text-2xl font-bold mb-6">Post-Lesson Summary</h1>
            <SummaryBoard studentId={studentId} entries={data.entries} />
        </div>
    );
}
