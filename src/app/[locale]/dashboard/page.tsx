import { getTranslations } from 'next-intl/server';
import { AddStudentDialog } from '@/components/dashboard/AddStudentDialog';
import { StudentList } from '@/components/dashboard/StudentList';
import { getStudents } from '@/actions/students';
import { getTeacherTier } from '@/actions/subscription';
import { TierBadge } from '@/components/subscription/TierBadge';
import { Suspense } from 'react';

export default async function DashboardPage() {
    const t = await getTranslations('Dashboard');
    const students = await getStudents();
    const tier = await getTeacherTier();

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <TierBadge tier={tier as 'free' | 'pro'} />
                </div>
                <AddStudentDialog />
            </div>

            <p className="text-sm text-gray-500 mb-4">
                Archived students can be restored from the dropdown menu.
            </p>

            <Suspense fallback={<div>Loading...</div>}>
                <StudentList students={students} />
            </Suspense>
        </div>
    );
}
