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
        <div className="container mx-auto py-12 px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{t('title')}</h1>
                        <TierBadge tier={tier as 'free' | 'pro'} />
                    </div>
                    <p className="text-slate-500 font-medium opacity-70">
                        Manage your teaching workflow with precision and style.
                    </p>
                </div>
                <AddStudentDialog />
            </div>

            <div className="bg-slate-900/5 px-4 py-2 rounded-full inline-block mb-8 border border-slate-900/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tip: Archived students can be restored from the dropdown menu.
            </div>

            <Suspense fallback={<div className="flex items-center justify-center p-20 text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Synchronizing Students...</div>}>
                <StudentList students={students} />
            </Suspense>
        </div>
    );
}
