import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default async function HomePage() {
  const { userId } = await auth();
  const t = await getTranslations('HomePage');

  // If logged in, go to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('about')}</p>
        <div className="flex gap-4 justify-center">
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
