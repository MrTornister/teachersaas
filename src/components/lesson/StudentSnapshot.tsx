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
            <Card className="p-6 glass mb-6 border-none">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{studentName}</h2>
                    {studentContext?.targetLanguage && (
                        <span className="bg-blue-500/10 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                            {studentContext.targetLanguage}
                        </span>
                    )}
                </div>
                {studentContext?.privateNote && (
                    <div className="mb-4 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-sm text-slate-700 flex gap-3">
                        <span className="shrink-0 font-bold text-amber-600">Note:</span>
                        {studentContext.privateNote}
                    </div>
                )}
                <p className="text-sm text-slate-400 italic font-medium">No snapshot yet. Complete a lesson to create one.</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 glass mb-6 border-none">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-900/5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{studentName}</h2>
                    {studentContext?.targetLanguage && (
                        <p className="text-slate-500 text-sm font-semibold mt-1 uppercase tracking-wide opacity-70">{studentContext.targetLanguage}</p>
                    )}
                </div>
                {studentContext?.privateNote && (
                    <div className="max-w-xs text-xs bg-amber-500/5 text-amber-900/70 p-3 rounded-xl border border-amber-500/10 italic font-medium">
                        "{studentContext.privateNote}"
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {card.active_goal && (
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-500/10 p-2 rounded-xl shrink-0">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 opacity-60">{t('activeGoal')}</p>
                                <p className="text-slate-900 font-bold leading-tight">{card.active_goal}</p>
                            </div>
                        </div>
                    )}

                    {card.homework && (
                        <div className="flex items-start gap-4">
                            <div className="bg-indigo-500/10 p-2 rounded-xl shrink-0">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 opacity-60">{t('homework')}</p>
                                <p className="text-slate-800 text-sm font-medium leading-relaxed">
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
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-500/10 p-2 rounded-xl shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 opacity-60">{t('focusAreas')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {card.focus_areas.map((area, i) => (
                                        <span key={i} className="bg-white/50 border border-slate-900/5 text-slate-700 text-[11px] px-3 py-1.5 rounded-full font-bold shadow-sm backdrop-blur-sm">
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
