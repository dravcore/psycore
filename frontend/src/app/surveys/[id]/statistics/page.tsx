'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { statisticsApi, SurveyStatistics } from '@/lib/api/statistics';
import Navbar from '@/components/Navbar';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  🧠 PsyCore
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fadeIn">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Hata</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
                📊 Anket İstatistikleri
              </h1>
              <p className="text-gray-600 text-lg">{statistics.title}</p>
            </div>
            <Link
              href={`/surveys/${surveyId}/ai-insights`}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span>🤖</span>
              <span className="font-medium">
                {statistics.hasAIAnalysis ? 'Analiz Sonuçlarını Gör' : 'AI Analizi Yap'}
              </span>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Toplam Yanıt</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{statistics.totalResponses}</p>
              </div>
              <div className="text-5xl">📝</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tamamlanma Oranı</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{statistics.completionRate}%</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Soru Sayısı</p>
                <p className="text-4xl font-bold text-indigo-600 mt-2">{statistics.questions.length}</p>
              </div>
              <div className="text-5xl">❓</div>
            </div>
          </div>
        </div>

        {/* Question Statistics */}
        <div className="space-y-6">
          {statistics.questions.map((question, index) => (
            <div
              key={question.questionId}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Soru {index + 1}
                    </h3>
                    <p className="text-gray-600">{question.questionText}</p>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg text-sm font-medium">
                    {question.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {question.totalResponses} yanıt
                </p>
              </div>

              {/* Average for numeric questions */}
              {question.averageValue !== undefined && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Ortalama Değer</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                    {question.averageValue.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Distribution chart */}
              {question.distribution && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
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
                          <span className="text-sm text-gray-700 font-medium w-24 capitalize flex items-center">
                            {emoji && <span className="mr-1">{emoji}</span>}
                            {value}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-7 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full flex items-center justify-end px-3 transition-all"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-xs text-white font-semibold">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right ml-3 font-medium">
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
                  <p className="text-sm font-medium text-gray-700 mb-3">En Sık Verilen Yanıtlar</p>
                  <div className="space-y-2">
                    {question.commonAnswers.map((answer, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                      >
                        <span className="text-gray-700">{answer.value}</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium">
                          {answer.count} kez
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
        </div>
      </div>
    </div>
  );
}
