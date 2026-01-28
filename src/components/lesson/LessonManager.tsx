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
        <div className="flex flex-col h-[calc(100vh-120px)]">
            {/* Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
                {optimisticEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className={cn(
                            "p-3 rounded-lg text-sm border-l-4 shadow-sm animate-in fade-in slide-in-from-bottom-2",
                            entry.type === 'homework' && "bg-blue-50 border-blue-500",
                            entry.type === 'error' && "bg-red-50 border-red-500",
                            entry.type === 'insight' && "bg-amber-50 border-amber-500",
                            entry.type === 'note' && "bg-white border-slate-300",
                            entry.isOptimistic && "opacity-70"
                        )}
                    >
                        <div className="font-semibold text-xs opacity-50 uppercase mb-1 flex items-center gap-2">
                            {t(entry.type)}
                            {entry.isOptimistic && <Loader2 className="h-3 w-3 animate-spin" />}
                        </div>
                        {entry.content}
                    </div>
                ))}
                {optimisticEntries.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        {t('emptyState')}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-50 border-t">
                <form ref={formRef} action={handleSubmit} className="relative">
                    <Input
                        name="content"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('inputPlaceholder')} // e.g., "Type a note or /hw for homework..."
                        className="w-full shadow-sm bg-white"
                        autoFocus
                        autoComplete="off"
                    />
                    <div className="absolute right-3 top-2.5 text-xs text-gray-400 flex gap-2">
                        <span>/hw</span>
                        <span>/err</span>
                        <span>/in</span>
                    </div>
                </form>
            </div>

            <div className="p-2 bg-gray-50 flex justify-end">
                <Button variant="destructive" size="sm" onClick={handleStop} className="gap-2">
                    <Square size={14} fill="currentColor" />
                    Stop Lesson
                </Button>
            </div>
        </div>
    );
}
