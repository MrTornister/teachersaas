'use client';

import { UserButton } from '@clerk/nextjs';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface NavbarProps {
    isAdmin: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
    const t = useTranslations('Dashboard');

    return (
        <nav className="border-b bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                        Teacher SaaS
                    </Link>
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                        {t('title')}
                    </Link>
                    {isAdmin && (
                        <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                            Admin
                        </Link>
                    )}
                </div>
                <UserButton afterSignOutUrl="/" />
            </div>
        </nav>
    );
}
