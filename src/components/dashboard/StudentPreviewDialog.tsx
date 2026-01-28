'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Loader2, Save, Play } from 'lucide-react';
import { updateStudent } from '@/actions/students';
import { StudentSnapshot } from '../lesson/StudentSnapshot';
import { Link } from '@/i18n/routing';

interface StudentPreviewDialogProps {
    studentId: string;
    studentName: string;
    targetLanguage: string | null;
    currentPrivateNote: string | null;
    latestCard: {
        active_goal: string;
        focus_areas: string[];
        homework: string | { text: string; done: boolean };
        backlog: string[];
    } | null;
    hasPendingSummary: boolean;
    isLessonInProgress: boolean;
}

export function StudentPreviewDialog({
    studentId,
    studentName,
    targetLanguage,
    currentPrivateNote,
    latestCard,
    hasPendingSummary,
    isLessonInProgress
}: StudentPreviewDialogProps) {
    const t = useTranslations('Dashboard');
    const [isOpen, setIsOpen] = useState(false);
    const [privateNote, setPrivateNote] = useState(currentPrivateNote || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveNote = async () => {
        setIsSaving(true);
        try {
            await updateStudent({
                id: studentId,
                privateNote: privateNote
            });
            // Optional: Show success toast
        } catch (error) {
            console.error('Failed to update note', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Eye size={16} />
                    Prep
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center text-2xl font-bold">
                        <span>{studentName}</span>
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                        {targetLanguage && (
                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                {targetLanguage}
                            </span>
                        )}
                        <span className="text-xs text-slate-500">Lesson Preparation Mode</span>
                    </div>
                    <DialogDescription className="sr-only">
                        Prepare for the lesson without starting it. Review snapshot and update your private notes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Private Note Edit - MOVED TO TOP FOR TEACHER PREP */}
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <Label htmlFor="privateNote" className="text-amber-800 font-bold flex items-center gap-2 text-sm uppercase tracking-tight">
                                📝 Teacher&apos;s Private Notes / Prep
                            </Label>
                            {privateNote !== (currentPrivateNote || '') && (
                                <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold animate-pulse">
                                    UNSAVED
                                </span>
                            )}
                        </div>
                        <Textarea
                            id="privateNote"
                            value={privateNote}
                            onChange={(e) => setPrivateNote(e.target.value)}
                            placeholder="What do you want to focus on today? Did they do their homework? Any specific feedback?"
                            className="bg-white min-h-[120px] border-amber-200 focus-visible:ring-amber-400 text-slate-800 placeholder:text-slate-400"
                        />
                        <div className="flex justify-end mt-3">
                            <Button
                                size="sm"
                                onClick={handleSaveNote}
                                disabled={isSaving || privateNote === (currentPrivateNote || '')}
                                variant="secondary"
                                className="gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 font-semibold"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save Prep Notes
                            </Button>
                        </div>
                    </div>

                    {/* Snapshot View */}
                    <div className="border-t pt-6">
                        <Label className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] mb-4 block">
                            Latest Lesson Snapshot
                        </Label>
                        <StudentSnapshot
                            studentName={studentName}
                            card={latestCard}
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-between gap-4 border-t pt-6">
                    <div className="text-[11px] text-slate-400 flex items-center italic">
                        * These notes are for you only and will be visible during the lesson.
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-500 hover:bg-slate-50">
                            Close
                        </Button>
                        <Link href={`/lesson/${studentId}`} className="w-full sm:w-auto">
                            <Button className="w-full gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 h-11 px-6 text-base font-bold">
                                <Play size={20} className="fill-current" />
                                {isLessonInProgress ? t('continueLesson', { defaultValue: 'Continue Lesson' }) : t('startLesson')}
                            </Button>
                        </Link>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
