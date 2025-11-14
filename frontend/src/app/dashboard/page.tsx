'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-xl">🧠</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PsyCore</h1>
              </div>
              <Link href="/surveys" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Anketler
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Hoş geldin, </span>
                <span className="font-semibold text-gray-900">{user.username}</span>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hoş geldin, {user.username}! 👋
            </h2>
            <div className="bg-white shadow rounded-lg p-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  Profil Bilgileri
                </h3>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Email</dt>
                    <dd className="text-sm text-gray-900 font-semibold">{user.email}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Kullanıcı Adı</dt>
                    <dd className="text-sm text-gray-900 font-semibold">{user.username}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm font-medium text-gray-600">Rol</dt>
                    <dd>
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {user.role}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📊</span>
                  İstatistikler
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Oluşturulan Anketler</span>
                    <span className="text-2xl font-bold text-purple-600">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cevaplanan Anketler</span>
                    <span className="text-2xl font-bold text-purple-600">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Puan</span>
                    <span className="text-2xl font-bold text-purple-600">0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <span className="text-3xl mr-4">🚀</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Hemen Başlayın!</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Psikolojik değerlendirme anketleri oluşturun veya mevcut anketleri doldurun.
                  </p>
                  <Link
                    href="/surveys"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Anketlere Git
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
