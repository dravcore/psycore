'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { dashboardApi, DashboardStats } from '@/lib/api/dashboard';
import { StatCardSkeleton } from '@/components/Skeletons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [user, router, hydrated]);

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

  if (!hydrated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <Navbar />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
              Hoş geldin, {user.username}! 👋
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-lg">İşte bugünkü özet ve hızlı erişimler</p>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Anket</CardTitle>
                  <span className="text-4xl">📝</span>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600">{stats.totalSurveys}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.activeSurveys} aktif</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Yanıt</CardTitle>
                  <span className="text-4xl">💬</span>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-600">{stats.totalResponses}</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">AI Analizi</CardTitle>
                  <span className="text-4xl">🤖</span>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-indigo-600">{stats.analyzedResponses}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.totalTextResponses} metin</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Genel Duygu</CardTitle>
                  <span className="text-4xl">😊</span>
                </CardHeader>
                <CardContent>
                  {stats.sentimentOverview && (
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((stats.sentimentOverview.positive / (stats.sentimentOverview.positive + stats.sentimentOverview.negative + stats.sentimentOverview.neutral + stats.sentimentOverview.mixed)) * 100)}% +
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/surveys/create">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">➕</span>
                    <svg className="w-6 h-6 text-muted-foreground group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <CardTitle>Yeni Anket Oluştur</CardTitle>
                  <CardDescription>Özel anketler tasarlayın</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/surveys">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">📝</span>
                    <svg className="w-6 h-6 text-muted-foreground group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <CardTitle>Anketlerim</CardTitle>
                  <CardDescription>Tüm anketleri görüntüle</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/timeline">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-4xl">📈</span>
                    <svg className="w-6 h-6 text-muted-foreground group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <CardTitle>Ruh Hali Çizelgesi</CardTitle>
                  <CardDescription>Duygusal trend analizi</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-3xl mr-3">📊</span>
                Genel Bakış
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <span className="text-2xl mr-2">👤</span>
                      Profil Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-3">
                      <div className="flex items-center justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                        <dd className="text-sm font-semibold">{user.email}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Kullanıcı Adı</dt>
                        <dd className="text-sm font-semibold">{user.username}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Rol</dt>
                        <dd>
                          <span className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                            {user.role}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <span className="text-2xl mr-2">📊</span>
                      İstatistikler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Oluşturulan Anketler</span>
                        <span className="text-2xl font-bold text-purple-600">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cevaplanan Anketler</span>
                        <span className="text-2xl font-bold text-purple-600">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Toplam Puan</span>
                        <span className="text-2xl font-bold text-purple-600">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <span className="text-3xl mr-4">🚀</span>
                    <div>
                      <h4 className="font-bold mb-2">Hemen Başlayın!</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Psikolojik değerlendirme anketleri oluşturun veya mevcut anketleri doldurun.
                      </p>
                      <Link
                        href="/surveys"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        Anketlere Git
                        <span className="ml-2">→</span>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
