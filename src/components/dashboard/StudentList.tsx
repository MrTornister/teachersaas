'use client';

import { useTranslations } from 'next-intl';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Play, MoreHorizontal, Trash2, Link as LinkIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveStudent } from '@/actions/students';
import { EditStudentDialog } from './EditStudentDialog';
import { StudentPreviewDialog } from './StudentPreviewDialog';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StickyNote, Target, BookOpen } from 'lucide-react';

interface StudentListProps {
    students: {
        id: string;
        name: string;
        status: 'active' | 'archived';
        teacherId: string;
        accessToken: string | null;
        targetLanguage: string | null;
        privateNote: string | null;
        hasPendingSummary: boolean;
        isLessonInProgress: boolean;
        latestCard: {
            active_goal?: string;
            homework?: string | { text: string; done: boolean };
            focus_areas?: string[];
        } | null;
        lastLessonDate: Date | null;
    }[];
}

export function StudentList({ students }: StudentListProps) {
    const t = useTranslations('Dashboard');

    const handleArchive = async (id: string) => {
        if (confirm(t('archive') + '?')) {
            await archiveStudent(id);
        }
    };

    const copyLink = (token: string | null) => {
        if (!token) return;
        const link = `${window.location.origin}/s/${token}`;
        navigator.clipboard.writeText(link);
        alert('Link copied!');
    };

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => {
                    const homeworkText = typeof student.latestCard?.homework === 'string'
                        ? student.latestCard.homework
                        : student.latestCard?.homework?.text;

                    return (
                        <Card key={student.id} className="glass-card flex flex-col border-none">
                            <CardHeader className="pb-3 relative">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="pr-8">
                                        <CardTitle className="text-xl font-bold text-slate-800">{student.name}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1 min-h-[20px]">
                                            {student.targetLanguage && (
                                                <Badge variant="outline" className="text-xs font-normal text-slate-500 bg-slate-50 border-slate-200">
                                                    {student.targetLanguage}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute right-4 top-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                    <MoreHorizontal size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => copyLink(student.accessToken)}>
                                                    <LinkIcon className="mr-2 h-4 w-4" />
                                                    <span>Copy Link</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <EditStudentDialog
                                                        studentId={student.id}
                                                        currentName={student.name}
                                                        currentTargetLanguage={student.targetLanguage}
                                                        currentPrivateNote={student.privateNote}
                                                    />
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleArchive(student.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>{t('archive')}</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4 mt-2">
                                    {student.isLessonInProgress ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 animate-pulse border border-blue-200 shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2"></span>
                                            Live Lesson
                                        </span>
                                    ) : student.hasPendingSummary ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                                            {t('pendingSummary')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                            {t('ready')}
                                        </span>
                                    )}

                                    {student.privateNote && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <StickyNote className="h-4 w-4 text-slate-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs text-xs">{student.privateNote}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}

                                    {student.lastLessonDate && (
                                        <span className="text-xs text-gray-400 ml-auto font-mono">
                                            {new Date(student.lastLessonDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-2">
                                    <StudentPreviewDialog
                                        studentId={student.id}
                                        studentName={student.name}
                                        targetLanguage={student.targetLanguage}
                                        currentPrivateNote={student.privateNote}
                                        latestCard={student.latestCard as any}
                                        hasPendingSummary={student.hasPendingSummary}
                                        isLessonInProgress={student.isLessonInProgress}
                                    />
                                </div>

                                {/* Rich Snapshot Data */}
                                <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-100 text-sm">
                                    {student.latestCard?.active_goal ? (
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <Target size={10} /> Active Goal
                                            </p>
                                            <p className="text-slate-800 font-medium line-clamp-2">{student.latestCard.active_goal}</p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 italic text-xs py-1">No active goal set</div>
                                    )}

                                    {student.latestCard?.focus_areas && student.latestCard.focus_areas.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {student.latestCard.focus_areas.map((area, idx) => (
                                                <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {homeworkText && (
                                        <div className="pt-2.5 border-t border-slate-200/60 mt-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <BookOpen size={10} /> Homework
                                            </p>
                                            <p className="text-slate-700 line-clamp-1 italic">{homeworkText}</p>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardFooter className="pt-0 mt-auto pb-4">
                                <Link href={`/lesson/${student.id}`} className="w-full">
                                    <Button className="w-full gap-2 font-semibold shadow-sm"
                                        variant={student.isLessonInProgress ? "default" : student.hasPendingSummary ? "secondary" : "default"}
                                        size="lg"
                                    >
                                        {student.isLessonInProgress ? (
                                            <>
                                                <Play size={18} className="fill-current" />
                                                Continue Lesson
                                            </>
                                        ) : student.hasPendingSummary ? (
                                            <>Complete Summary</>
                                        ) : (
                                            <>
                                                <Play size={18} className="fill-current" />
                                                {t('startLesson')}
                                            </>
                                        )}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}
