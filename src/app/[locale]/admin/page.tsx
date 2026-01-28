import { getAllTeachers } from '@/actions/admin';
import { TeacherTable } from '@/components/admin/TeacherTable';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/actions/admin';

export default async function AdminPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/dashboard');
    }

    const t = await getTranslations('Admin');
    const teachers = await getAllTeachers();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

            <div className="bg-white rounded-lg shadow">
                <TeacherTable teachers={teachers} />
            </div>
        </div>
    );
}
