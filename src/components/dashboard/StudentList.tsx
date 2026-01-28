'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Play, MoreHorizontal, Trash2, Edit, Link as LinkIcon } from 'lucide-react';
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


interface StudentListProps {
    students: {
        id: string;
        name: string;
        status: 'active' | 'archived';
        teacherId: string;
        accessToken: string | null;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle>{student.name}</CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => copyLink(student.accessToken)}>
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        <span>Copy Link</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{t('edit')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleArchive(student.id)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>{t('archive')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {/* Visual Status Indicator placeholder */}
                        <CardDescription className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {t('ready')}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between pt-4">
                        <Link href={`/lesson/${student.id}`}>
                            <Button size="sm" className="gap-2">
                                <Play size={14} />
                                {t('startLesson')}
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
