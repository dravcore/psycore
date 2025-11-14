'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { dashboardApi, DashboardStats } from '@/lib/api/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
              Hoş geldin, {user.username}! 👋
            </h1>
            <p className="text-gray-600 text-lg">İşte bugünkü özet ve hızlı erişimler</p>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Toplam Anket</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalSurveys}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.activeSurveys} aktif</p>
                  </div>
                  <div className="text-5xl">📝</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Toplam Yanıt</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{stats.totalResponses}</p>
                  </div>
                  <div className="text-5xl">💬</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">AI Analizi</p>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.analyzedResponses}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.totalTextResponses} metin</p>
                  </div>
                  <div className="text-5xl">🤖</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Genel Duygu</p>
                    {stats.sentimentOverview && (
                      <div className="mt-2">
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round((stats.sentimentOverview.positive / (stats.sentimentOverview.positive + stats.sentimentOverview.negative + stats.sentimentOverview.neutral + stats.sentimentOverview.mixed)) * 100)}% +
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-5xl">😊</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/surveys/create"
              className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">➕</span>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Yeni Anket Oluştur</h3>
              <p className="text-sm text-gray-600">Özel anketler tasarlayın</p>
            </Link>

            <Link
              href="/surveys"
              className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">📝</span>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Anketlerim</h3>
              <p className="text-sm text-gray-600">Tüm anketleri görüntüle</p>
            </Link>

            <Link
              href="/profile"
              className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">👤</span>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Profil Ayarları</h3>
              <p className="text-sm text-gray-600">Bilgilerinizi düzenleyin</p>
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-3">📊</span>
              Genel Bakış
            </h2>
            
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
