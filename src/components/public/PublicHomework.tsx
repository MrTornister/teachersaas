'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { toggleHomework } from '@/actions/public';

interface PublicHomeworkProps {
    homework: string | { text: string; done: boolean };
    token: string;
}

export function PublicHomework({ homework, token }: PublicHomeworkProps) {
    const [isPending, setIsPending] = useState(false);

    // Parse incoming data
    const text = typeof homework === 'string' ? homework : homework?.text;
    const isDone = typeof homework === 'object' ? homework.done : false;

    const handleToggle = async () => {
        setIsPending(true);
        try {
            await toggleHomework(token);
        } finally {
            setIsPending(false);
        }
    };

    if (!text) return null;

    return (
        <Card
            className={`p-4 transition-colors cursor-pointer border-2 ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-transparent hover:border-indigo-100'}`}
            onClick={handleToggle}
        >
            <div className="flex items-start gap-3">
                <div className={`mt-1 ${isPending ? 'opacity-50' : ''}`}>
                    {isDone ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                        <Circle className="h-6 w-6 text-gray-300" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Homework</h3>
                    <p className={`text-gray-700 ${isDone ? 'line-through text-gray-500' : ''}`}>{text}</p>
                    <p className="text-xs text-gray-400 mt-2">
                        {isDone ? 'Completed' : 'Click to mark as done'}
                    </p>
                </div>
            </div>
        </Card>
    );
}
