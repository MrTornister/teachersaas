import { getTranslations } from 'next-intl/server';
import { AddStudentDialog } from '@/components/dashboard/AddStudentDialog';
import { StudentList } from '@/components/dashboard/StudentList';
import { getStudents } from '@/actions/students';
import { Suspense } from 'react';

export default async function DashboardPage() {
    const t = await getTranslations('Dashboard');
    const students = await getStudents();

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <AddStudentDialog />
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <StudentList students={students} />
            </Suspense>
        </div>
    );
}
