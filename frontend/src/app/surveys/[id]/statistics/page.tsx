'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { statisticsApi, SurveyStatistics } from '@/lib/api/statistics';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StatisticsPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, [surveyId]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getSurveyStatistics(surveyId);
      setStatistics(data);
    } catch (err: any) {
      console.error('Statistics load error:', err);
      setError(err.response?.data?.message || 'İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertDescription className="flex items-start space-x-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Hata</p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                📊 Anket İstatistikleri
              </h1>
              <p className="text-muted-foreground text-lg">{statistics.title}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys/${surveyId}/export`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      },
                    });
                    const data = await response.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${statistics.title.replace(/\s+/g, '_')}_export.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Veriler başarıyla dışa aktarıldı!');
                  } catch (error) {
                    console.error('Export failed:', error);
                    toast.error('Dışa aktarma başarısız oldu');
                  }
                }}
                className="flex items-center gap-2"
              >
                <span>📥</span>
                <span>Dışa Aktar</span>
              </button>
              <Link href={`/surveys/${surveyId}/ai-insights`}>
                <button className="flex items-center gap-2 px-6 py-3">
                <span>🤖</span>
                <span>
                  {statistics.hasAIAnalysis ? 'Analiz Sonuçlarını Gör' : 'AI Analizi Yap'}
                </span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Toplam Yanıt</p>
                <p className="text-4xl font-bold text-foreground mt-2">{statistics.totalResponses}</p>
              </div>
              <div className="text-5xl">📝</div>
            </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Tamamlanma Oranı</p>
                <p className="text-4xl font-bold text-foreground mt-2">{statistics.completionRate}%</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Soru Sayısı</p>
                <p className="text-4xl font-bold text-foreground mt-2">{statistics.questions.length}</p>
              </div>
              <div className="text-5xl">❓</div>
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Statistics */}
        <div className="space-y-6">
          {statistics.questions.map((question, index) => (
            <Card key={question.questionId} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      Soru {index + 1}
                    </h3>
                    <p className="text-muted-foreground">{question.questionText}</p>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {question.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {question.totalResponses} yanıt
                </p>
              </div>

              {/* Average for numeric questions */}
              {question.averageValue !== undefined && (
                <div className="mb-4 p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Ortalama Değer</p>
                  <p className="text-3xl font-bold text-foreground">
                    {question.averageValue.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Distribution chart */}
              {question.distribution && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-3">
                    {question.type === 'YESNO' ? 'Evet/Hayır Dağılımı' : 'Dağılım'}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(question.distribution).map(([value, count]) => {
                      const percentage = (count / question.totalResponses) * 100;
                      const emoji = question.type === 'YESNO' 
                        ? (value.toLowerCase() === 'evet' || value.toLowerCase() === 'yes' ? '✅' : '❌')
                        : '';
                      return (
                        <div key={value} className="flex items-center">
                          <span className="text-sm font-medium w-24 capitalize flex items-center">
                            {emoji && <span className="mr-1">{emoji}</span>}
                            {value}
                          </span>
                          <div className="flex-1 bg-secondary rounded-full h-7 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full flex items-center justify-end px-3 transition-all"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-xs text-primary-foreground font-semibold">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground w-16 text-right ml-3 font-medium">
                            {count} kişi
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Common text answers */}
              {question.commonAnswers && question.commonAnswers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">En Sık Verilen Yanıtlar</p>
                  <div className="space-y-2">
                    {question.commonAnswers.map((answer, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted rounded-xl"
                      >
                        <span>{answer.value}</span>
                        <Badge>
                          {answer.count} kez
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Metadata */}
        <Card className="mt-8">
          <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Oluşturulma:</span>{' '}
              {new Date(statistics.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            {statistics.lastResponseAt && (
              <div>
                <span className="font-medium">Son Yanıt:</span>{' '}
                {new Date(statistics.lastResponseAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
