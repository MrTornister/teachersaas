import { Card } from '@/components/ui/card';
import { CheckCircle2, Target, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StudentSnapshotProps {
    studentName: string;
    studentContext?: {
        targetLanguage?: string | null;
        privateNote?: string | null;
    };
    card: {
        active_goal: string;
        focus_areas: string[];
        homework: string | { text: string; done: boolean };
        backlog: string[];
    } | null;
}

export function StudentSnapshot({ studentName, studentContext, card }: StudentSnapshotProps) {
    const t = useTranslations('Summary');

    if (!card) {
        return (
            <Card className="p-4 bg-gray-50 mb-6 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{studentName}</h2>
                    {studentContext?.targetLanguage && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                            {studentContext.targetLanguage}
                        </span>
                    )}
                </div>
                {studentContext?.privateNote && (
                    <div className="mb-4 bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm text-slate-600 flex gap-2">
                        <span className="shrink-0 font-bold text-yellow-600">Note:</span>
                        {studentContext.privateNote}
                    </div>
                )}
                <p className="text-sm text-gray-500 italic">No snapshot yet. Complete a lesson to create one.</p>
            </Card>
        );
    }

    return (
        <Card className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm mb-6">
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{studentName}</h2>
                    {studentContext?.targetLanguage && (
                        <p className="text-slate-500 text-sm font-medium mt-1">{studentContext.targetLanguage}</p>
                    )}
                </div>
                {studentContext?.privateNote && (
                    <div className="max-w-xs text-xs bg-yellow-50 text-slate-700 p-2 rounded border border-yellow-100 italic">
                        "{studentContext.privateNote}"
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    {card.active_goal && (
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-1.5 rounded-full shrink-0">
                                <Target className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('activeGoal')}</p>
                                <p className="text-slate-900 font-medium">{card.active_goal}</p>
                            </div>
                        </div>
                    )}

                    {card.homework && (
                        <div className="flex items-start gap-3">
                            <div className="bg-indigo-100 p-1.5 rounded-full shrink-0">
                                <BookOpen className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('homework')}</p>
                                <p className="text-slate-900 text-sm">
                                    {typeof card.homework === 'string'
                                        ? card.homework
                                        : card.homework?.text}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    {card.focus_areas && card.focus_areas.length > 0 && (
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-100 p-1.5 rounded-full shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('focusAreas')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {card.focus_areas.map((area, i) => (
                                        <span key={i} className="bg-white border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
