'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Survey } from '@/lib/api/surveys';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import Tooltip from '@/components/Tooltip';
import { useNotificationStore } from '@/store/notificationStore';

export default function SurveysPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; surveyId: string | null }>({ isOpen: false, surveyId: null });
  const { addNotification } = useNotificationStore();

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

  const handleDelete = async () => {
    if (!deleteDialog.surveyId) return;

    try {
      await surveysApi.delete(deleteDialog.surveyId);
      setSurveys(surveys.filter((s) => s.id !== deleteDialog.surveyId));
      addNotification({ type: 'success', title: 'Başarılı', message: 'Anket başarıyla silindi' });
      setDeleteDialog({ isOpen: false, surveyId: null });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Hata', message: err.response?.data?.message || 'Anket silinirken hata oluştu' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

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
            <div className="py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : surveys.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
              <EmptyState
                icon="📝"
                title="Henüz Anket Yok"
                description="İlk psikolojik değerlendirme anketinizi oluşturun ve kullanıcılardan yanıt almaya başlayın."
                action={{ label: 'İlk Anketi Oluştur', onClick: () => router.push('/surveys/create') }}
              />
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
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Link
                        href={`/surveys/${survey.id}`}
                        className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                      >
                        Görüntüle
                      </Link>
                      {user.id === survey.creatorId && (
                        <Tooltip content="Anketi Sil">
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, surveyId: survey.id })}
                            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold border border-red-200"
                          >
                            🗑️
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    {user.id === survey.creatorId && (survey._count?.responses || 0) > 0 && (
                      <Tooltip content="Anket sonuçlarını ve istatistikleri görüntüle">
                        <Link
                          href={`/surveys/${survey.id}/statistics`}
                          className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 text-sm font-semibold border border-emerald-200"
                        >
                          <span className="mr-2">📊</span>
                          İstatistikleri Gör
                        </Link>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Anketi Sil"
        message="Bu anketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm yanıtlar silinecektir."
        confirmText="Evet, Sil"
        cancelText="İptal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, surveyId: null })}
        type="danger"
      />
    </div>
  );
}
