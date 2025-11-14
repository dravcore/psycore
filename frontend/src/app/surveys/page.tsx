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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-xl">🧠</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PsyCore</span>
              </Link>
              <Link href="/surveys" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                Anketler
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">{user.username}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Anketler</h1>
              <p className="text-gray-600 mt-2">Tüm anketleri görüntüleyin ve yönetin</p>
            </div>
            <Link
              href="/surveys/create"
              className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center"
            >
              <span className="text-xl mr-2">+</span>
              Yeni Anket Oluştur
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
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
                <div key={survey.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {survey.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        survey.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {survey.isActive ? '✓ Aktif' : '○ Pasif'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {survey.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
                    <span className="flex items-center">
                      <span className="text-lg mr-1">📝</span>
                      {survey._count?.questions || 0} soru
                    </span>
                    <span className="flex items-center">
                      <span className="text-lg mr-1">✅</span>
                      {survey._count?.responses || 0} cevap
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/surveys/${survey.id}`}
                      className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                    >
                      Görüntüle
                    </Link>
                    {user.id === survey.creatorId && (
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold border border-red-200"
                      >
                        🗑️
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
