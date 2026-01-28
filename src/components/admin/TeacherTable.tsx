'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateTeacherTier } from '@/actions/admin';
import { useState } from 'react';

interface Teacher {
    id: string;
    email: string | null;
    planTier: 'free' | 'pro' | null;
    subscriptionStatus: string | null;
    createdAt: Date | null;
    studentCount: number;
}

interface TeacherTableProps {
    teachers: Teacher[];
}

export function TeacherTable({ teachers }: TeacherTableProps) {
    const t = useTranslations('Admin');
    const [updating, setUpdating] = useState<string | null>(null);

    const handleTierChange = async (teacherId: string, currentTier: 'free' | 'pro' | null) => {
        const newTier = currentTier === 'pro' ? 'free' : 'pro';
        setUpdating(teacherId);

        try {
            await updateTeacherTier(teacherId, newTier);
        } catch (error) {
            alert('Failed to update tier');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('email')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('tier')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('students')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('created')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('actions')}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher) => (
                        <tr key={teacher.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {teacher.email || teacher.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={teacher.planTier === 'pro' ? 'default' : 'secondary'}>
                                    {teacher.planTier?.toUpperCase() || 'FREE'}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {teacher.studentCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTierChange(teacher.id, teacher.planTier || 'free')}
                                    disabled={updating === teacher.id}
                                >
                                    {updating === teacher.id ? t('updating') :
                                        teacher.planTier === 'pro' ? t('downgrade') : t('upgrade')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
