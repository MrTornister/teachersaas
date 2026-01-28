'use client';

import { useState, useRef, useOptimistic, useTransition } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addEntry, stopSession } from '@/actions/lesson';
import { Loader2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

type EntryType = 'note' | 'homework' | 'error' | 'insight';

interface Entry {
    id: string;
    content: string;
    type: EntryType;
    createdAt: Date;
    isOptimistic?: boolean;
}

interface LessonInputProps {
    sessionId: string;
    initialEntries: Entry[];
}

export function LessonManager({ sessionId, initialEntries }: LessonInputProps) {
    const t = useTranslations('Lesson');
    const router = useRouter();
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const handleStop = async () => {
        // Change status to pending_summary
        await stopSession(sessionId);

        const path = window.location.pathname; // /pl/lesson/uuid
        router.push(`${path}/summary`);
    };

    const [optimisticEntries, addOptimisticEntry] = useOptimistic(
        initialEntries,
        (state, newEntry: Entry) => [newEntry, ...state]
    );

    const parseCommand = (text: string): { type: EntryType, content: string } => {
        if (text.startsWith('/hw ')) return { type: 'homework', content: text.slice(4) };
        if (text.startsWith('/err ')) return { type: 'error', content: text.slice(5) };
        if (text.startsWith('/in ')) return { type: 'insight', content: text.slice(4) };
        return { type: 'note', content: text };
    };

    async function handleSubmit(formData: FormData) {
        const rawContent = formData.get('content') as string;
        if (!rawContent.trim()) return;

        const { type, content } = parseCommand(rawContent);

        // Optimistic update
        addOptimisticEntry({
            id: crypto.randomUUID(),
            content,
            type,
            createdAt: new Date(),
            isOptimistic: true,
        });

        setInput('');
        formRef.current?.reset();

        startTransition(async () => {
            await addEntry(sessionId, content, type);
        });
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Feed Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse scrollbar-hide">
                {optimisticEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className={cn(
                            "p-4 rounded-2xl text-sm border-none shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500 glass",
                            entry.type === 'homework' && "bg-blue-500/10",
                            entry.type === 'error' && "bg-red-500/10",
                            entry.type === 'insight' && "bg-amber-500/10",
                            entry.type === 'note' && "bg-white/40",
                            entry.isOptimistic && "opacity-50 blur-[1px]"
                        )}
                    >
                        <div className="font-black text-[10px] opacity-40 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            {t(entry.type)}
                            {entry.isOptimistic && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                        </div>
                        <div className="text-slate-800 font-medium leading-relaxed">
                            {entry.content}
                        </div>
                    </div>
                ))}
                {optimisticEntries.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400/60 font-bold uppercase tracking-widest text-xs gap-4 mt-20">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
                            <Square size={16} className="opacity-20" />
                        </div>
                        {t('emptyState')}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6">
                <form ref={formRef} action={handleSubmit} className="relative">
                    <div className="glass rounded-full p-1 shadow-2xl flex items-center pr-4">
                        <Input
                            name="content"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('inputPlaceholder')}
                            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 h-14 px-6 text-lg placeholder:text-slate-400/60 font-medium"
                            autoFocus
                            autoComplete="off"
                        />
                        <div className="flex gap-1.5 ml-auto">
                            {['/hw', '/err', '/in'].map((cmd) => (
                                <span key={cmd} className="px-2 py-1 rounded-lg bg-slate-900/5 text-[10px] font-black text-slate-400/60 uppercase tracking-tighter">
                                    {cmd}
                                </span>
                            ))}
                        </div>
                    </div>
                </form>
            </div>

            <div className="px-6 pb-6 flex justify-between items-center">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40">
                    Live Lesson Session
                </div>
                <Button variant="ghost" size="sm" onClick={handleStop} className="gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold rounded-xl transition-all h-10 px-4">
                    <Square size={14} fill="currentColor" className="opacity-70" />
                    Stop Lesson
                </Button>
            </div>
        </div>
    );
}
