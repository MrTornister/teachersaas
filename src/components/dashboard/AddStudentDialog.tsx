'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStudent } from '@/actions/students';
import { Plus } from 'lucide-react';

export function AddStudentDialog() {
    const t = useTranslations('Dashboard');
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(formData: FormData) {
        try {
            setError('');
            await addStudent(formData);
            setOpen(false);
        } catch (e: unknown) {
            if (e instanceof Error && e.message === 'LIMIT_REACHED') {
                setError(t('limitReached'));
            } else {
                setError(t('genericError'));
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus size={16} />
                    {t('addStudent')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('addStudent')}</DialogTitle>
                    <DialogDescription>
                        {t('addStudentDesc')}
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                {t('studentName')}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <DialogFooter>
                        <Button type="submit">{t('save')}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
