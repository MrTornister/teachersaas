'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { SortableItem } from './SortableItem';
import { DroppableContainer } from './DroppableContainer';
import { commitSummary } from '@/actions/summary';
import { Loader2 } from 'lucide-react';

interface SummaryBoardProps {
    studentId: string;
    entries: {
        id: string;
        content: string;
        type: 'note' | 'homework' | 'error' | 'insight';
    }[];
}

type ItemsMap = {
    raw: SummaryBoardProps['entries'];
    active_goal: SummaryBoardProps['entries'];
    focus_areas: SummaryBoardProps['entries'];
    homework: SummaryBoardProps['entries'];
    backlog: SummaryBoardProps['entries'];
};

export function SummaryBoard({ studentId, entries }: SummaryBoardProps) {
    const t = useTranslations('Summary');
    const [items, setItems] = useState<ItemsMap>({
        raw: entries,
        active_goal: [],
        focus_areas: [],
        homework: [],
        backlog: [],
    });
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isCommitting, setIsCommitting] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeContainer = findContainer(active.id as string);
        const overContainer = (over.id in items) ? over.id as keyof ItemsMap : findContainer(over.id as string);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Limits Logic
        if (overContainer === 'active_goal' && items.active_goal.length >= 1) return; // Limit 1
        if (overContainer === 'homework' && items.homework.length >= 1) return; // Limit 1
        if (overContainer === 'focus_areas' && items.focus_areas.length >= 3) return; // Limit 3

        // Move item
        const item = items[activeContainer].find(i => i.id === active.id);
        if (!item) return;

        setItems(prev => ({
            ...prev,
            [activeContainer]: prev[activeContainer].filter(i => i.id !== active.id),
            [overContainer]: [...prev[overContainer], item]
        }));

        setActiveId(null);
    };

    const findContainer = (id: string): keyof ItemsMap | undefined => {
        if (id in items) return id as keyof ItemsMap;
        return Object.keys(items).find(key =>
            items[key as keyof ItemsMap].find(i => i.id === id)
        ) as keyof ItemsMap | undefined;
    };

    const handleCommit = async () => {
        setIsCommitting(true);
        await commitSummary(studentId, {
            active_goal: items.active_goal[0]?.content || '',
            focus_areas: items.focus_areas.map(i => i.content),
            homework: items.homework[0]?.content || '',
            backlog: items.backlog.map(i => i.content)
        });
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Left Column: Raw Inputs */}
                <div className="lg:col-span-1">
                    <DroppableContainer id="raw" title={t('rawEntries')}>
                        <SortableContext items={items.raw} strategy={verticalListSortingStrategy}>
                            {items.raw.map(item => <SortableItem key={item.id} {...item} />)}
                        </SortableContext>
                    </DroppableContainer>
                </div>

                {/* Right Column: Structure */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <DroppableContainer id="active_goal" title={t('activeGoal')}>
                            {items.active_goal.map(item => <SortableItem key={item.id} {...item} />)}
                        </DroppableContainer>
                        <DroppableContainer id="homework" title={t('homework')}>
                            {items.homework.map(item => <SortableItem key={item.id} {...item} />)}
                        </DroppableContainer>
                    </div>

                    <DroppableContainer id="focus_areas" title={t('focusAreas')}>
                        {items.focus_areas.map(item => <SortableItem key={item.id} {...item} />)}
                    </DroppableContainer>

                    <DroppableContainer id="backlog" title={t('backlog')}>
                        {items.backlog.map(item => <SortableItem key={item.id} {...item} />)}
                    </DroppableContainer>

                    <div className="flex justify-end pt-4">
                        <Button size="lg" onClick={handleCommit} disabled={isCommitting}>
                            {isCommitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('commit')}
                        </Button>
                    </div>
                </div>
            </div>
            <DragOverlay>
                {activeId ? (
                    <div className="p-4 bg-white shadow-lg rounded border opacity-80">Dragging...</div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
