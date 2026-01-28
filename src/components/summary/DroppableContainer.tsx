'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableContainerProps {
    id: string;
    title: string;
    children: React.ReactNode;
}

export function DroppableContainer({ id, title, children }: DroppableContainerProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "bg-gray-50 rounded-lg p-4 min-h-[150px] border-2 border-dashed border-gray-200 transition-colors",
                isOver && "border-blue-400 bg-blue-50"
            )}
        >
            <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}
