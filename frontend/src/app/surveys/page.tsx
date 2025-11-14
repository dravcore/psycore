'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Survey } from '@/lib/api/surveys';
import Navbar from '@/components/Navbar';
import { SurveyListSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import Tooltip from '@/components/Tooltip';
import { useNotificationStore } from '@/store/notificationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function SurveysPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; surveyId: string | null }>({ isOpen: false, surveyId: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const { addNotification } = useNotificationStore();
  const [hydrated, setHydrated] = useState(false);

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && survey.isActive) ||
      (filterStatus === 'inactive' && !survey.isActive);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    loadSurveys();
  }, [hydrated, user, router]);

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

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold">Anketler</h1>
              <p className="text-muted-foreground mt-2">Tüm anketleri görüntüleyin ve yönetin ({filteredSurveys.length} anket)</p>
            </div>
            <Link href="/surveys/create">
              <Button>
                <span className="text-xl mr-2">+</span>
                Yeni Anket Oluştur
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Anket ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                  >
                    Tümü
                  </Button>
                  <Button
                    variant={filterStatus === 'active' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('active')}
                  >
                    ✓ Aktif
                  </Button>
                  <Button
                    variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('inactive')}
                  >
                    ○ Pasif
                  </Button>
              </div>
            </div>
          </CardContent>
        </Card>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <SurveyListSkeleton count={6} />
          ) : filteredSurveys.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
              <EmptyState
                icon={surveys.length === 0 ? "📝" : "🔍"}
                title={surveys.length === 0 ? "Henüz Anket Yok" : "Sonuç Bulunamadı"}
                description={
                  surveys.length === 0
                    ? "İlk psikolojik değerlendirme anketinizi oluşturun ve kullanıcılardan yanıt almaya başlayın."
                    : "Arama kriterlerinize uygun anket bulunamadı. Farklı terimler deneyin."
                }
                action={
                  surveys.length === 0
                    ? { label: 'İlk Anketi Oluştur', onClick: () => router.push('/surveys/create') }
                    : { label: 'Filtreleri Temizle', onClick: () => { setSearchTerm(''); setFilterStatus('all'); } }
                }
              />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSurveys.map((survey) => (
                <Card key={survey.id} className="hover:shadow-lg transition-all group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {survey.title}
                      </CardTitle>
                      <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                        {survey.isActive ? '✓ Aktif' : '○ Pasif'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {survey.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 pb-4 border-b">
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
                        <Link href={`/surveys/${survey.id}`} className="flex-1">
                          <Button className="w-full">
                            Görüntüle
                          </Button>
                        </Link>
                        {user.id === survey.creatorId && (
                          <Tooltip content="Anketi Sil">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setDeleteDialog({ isOpen: true, surveyId: survey.id })}
                            >
                              🗑️
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                      {user.id === survey.creatorId && (survey._count?.responses || 0) > 0 && (
                        <Tooltip content="Anket sonuçlarını ve istatistikleri görüntüle">
                          <Link href={`/surveys/${survey.id}/statistics`} className="block">
                            <Button variant="outline" className="w-full">
                              <span className="mr-2">📊</span>
                              İstatistikleri Gör
                            </Button>
                          </Link>
                        </Tooltip>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, surveyId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anketi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu anketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm yanıtlar silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
