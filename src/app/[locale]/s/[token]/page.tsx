import { getStudentPublicData } from '@/actions/public';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function PublicStudentPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const data = await getStudentPublicData(token);
    const t = await getTranslations('Summary'); // Reuse summary translations

    if (!data) return notFound();

    const { student, card } = data;
    const cardData = card?.data as {
        active_goal: string;
        focus_areas: string[];
        homework: string;
        backlog: string[];
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
            <div className="w-full max-w-md space-y-6">
                <header className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Hello, {student.name} 👋</h1>
                    <p className="text-slate-500">Here is your latest snapshot.</p>
                </header>

                {cardData ? (
                    <div className="space-y-6">
                        <Card className="p-5 border-l-4 border-l-blue-500 shadow-sm">
                            <h3 className="text-sm uppercase font-bold text-slate-400 mb-2">{t('activeGoal')}</h3>
                            <p className="text-lg font-medium text-slate-800">{cardData.active_goal}</p>
                        </Card>

                        <Card className="p-5 border-l-4 border-l-amber-500 shadow-sm">
                            <h3 className="text-sm uppercase font-bold text-slate-400 mb-2">{t('focusAreas')}</h3>
                            <ul className="space-y-2">
                                {(cardData.focus_areas || []).map((area: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
                                        <span>{area}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card className="p-5 border-l-4 border-l-indigo-500 shadow-sm">
                            <h3 className="text-sm uppercase font-bold text-slate-400 mb-2">{t('homework')}</h3>
                            <p className="text-lg text-slate-800">{cardData.homework}</p>
                        </Card>
                    </div>
                ) : (
                    <Card className="p-8 text-center text-slate-400">
                        No data available yet.
                    </Card>
                )}
            </div>
        </div>
    );
}
