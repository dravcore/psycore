'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Survey } from '@/lib/api/surveys';

export default function SurveysPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadSurveys();
  }, [user, router]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveysApi.getAll();
      setSurveys(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Anketler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu anketi silmek istediğinizden emin misiniz?')) return;

    try {
      await surveysApi.delete(id);
      setSurveys(surveys.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Anket silinirken hata oluştu');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                PsyCore
              </Link>
              <Link href="/surveys" className="text-blue-600 font-medium">
                Anketler
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.username}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Anketler</h1>
            <Link
              href="/surveys/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Yeni Anket Oluştur
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Yükleniyor...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">Henüz anket bulunmuyor</p>
              <Link
                href="/surveys/create"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                İlk anketi oluştur →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {surveys.map((survey) => (
                <div key={survey.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {survey.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        survey.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {survey.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {survey.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>📝 {survey._count?.questions || 0} soru</span>
                    <span>✅ {survey._count?.responses || 0} cevap</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/surveys/${survey.id}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      Görüntüle
                    </Link>
                    {user.id === survey.creatorId && (
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
