'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SortableItemProps {
    id: string;
    type: 'note' | 'homework' | 'error' | 'insight';
    content: string;
}

export function SortableItem({ id, type, content }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const t = useTranslations('Lesson');

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2 touch-none">
            <Card className={cn(
                "p-3 text-sm border-l-4 cursor-grab active:cursor-grabbing hover:shadow-md",
                type === 'homework' && "bg-blue-50 border-blue-500",
                type === 'error' && "bg-red-50 border-red-500",
                type === 'insight' && "bg-amber-50 border-amber-500",
                type === 'note' && "bg-white border-slate-300",
            )}>
                <div className="font-semibold text-xs opacity-50 uppercase mb-1">
                    {t(type)}
                </div>
                {content}
            </Card>
        </div>
    );
}
