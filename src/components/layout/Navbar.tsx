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
        <nav className="glass-nav">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                        Teacher SaaS
                    </Link>
                    <div className="hidden md:flex gap-6">
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            {t('title')}
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                                Admin
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </nav>
    );
}
