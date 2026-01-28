'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateStudent } from '@/actions/students';
import { Edit } from 'lucide-react';

interface EditStudentDialogProps {
    studentId: string;
    currentName: string;
    currentTargetLanguage?: string | null;
    currentPrivateNote?: string | null;
}

export function EditStudentDialog({ studentId, currentName, currentTargetLanguage, currentPrivateNote }: EditStudentDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(currentName);
    const [targetLanguage, setTargetLanguage] = useState(currentTargetLanguage || '');
    const [privateNote, setPrivateNote] = useState(currentPrivateNote || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateStudent(studentId, name, targetLanguage, privateNote);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="targetLanguage">Target Language</Label>
                        <Input
                            id="targetLanguage"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            placeholder="e.g. English B2"
                        />
                    </div>
                    <div>
                        <Label htmlFor="privateNote">Private Note</Label>
                        <Input
                            id="privateNote"
                            value={privateNote}
                            onChange={(e) => setPrivateNote(e.target.value)}
                            placeholder="Only visible to you"
                        />
                    </div>
                    <Button type="submit">Save</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
