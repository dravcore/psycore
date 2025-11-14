'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardApi, Timeline } from '@/lib/api/dashboard';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TimelinePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadTimeline();
  }, [user, router]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getTimeline();
      setTimeline(data);
    } catch (err: any) {
      console.error('Timeline load error:', err);
      setError(err.response?.data?.message || 'Zaman çizelgesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
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

  if (!timeline || timeline.entries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz AI Analizi Yok</h3>
            <p className="text-gray-600">
              Ruh hali zaman çizelgenizi görmek için önce anketlerinize AI analizi yapın.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sentimentColors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280',
    mixed: '#f59e0b',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">
            📈 Ruh Hali Zaman Çizelgesi
          </h1>
          <p className="text-gray-600 text-lg">
            {new Date(timeline.overallStats.dateRange.start).toLocaleDateString('tr-TR')} - {new Date(timeline.overallStats.dateRange.end).toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Toplam Kayıt</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{timeline.overallStats.totalEntries}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Baskın Duygu</p>
            <p className="text-2xl font-bold mt-2" style={{ color: sentimentColors[timeline.overallStats.dominantSentiment] }}>
              {timeline.overallStats.dominantSentiment === 'positive' && '😊 Pozitif'}
              {timeline.overallStats.dominantSentiment === 'negative' && '😢 Negatif'}
              {timeline.overallStats.dominantSentiment === 'neutral' && '😐 Nötr'}
              {timeline.overallStats.dominantSentiment === 'mixed' && '😕 Karışık'}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:col-span-2">
            <p className="text-gray-600 text-sm font-medium mb-3">En Sık Duygular</p>
            <div className="flex flex-wrap gap-2">
              {timeline.overallStats.mostFrequentEmotions.slice(0, 5).map((emotion) => (
                <span
                  key={emotion.emotion}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {emotion.emotion} ({emotion.count})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Trend Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Duygu Durumu Trendi</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeline.sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="positive" stackId="1" stroke={sentimentColors.positive} fill={sentimentColors.positive} name="Pozitif" />
              <Area type="monotone" dataKey="negative" stackId="1" stroke={sentimentColors.negative} fill={sentimentColors.negative} name="Negatif" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke={sentimentColors.neutral} fill={sentimentColors.neutral} name="Nötr" />
              <Area type="monotone" dataKey="mixed" stackId="1" stroke={sentimentColors.mixed} fill={sentimentColors.mixed} name="Karışık" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Entries */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detaylı Kayıtlar</h2>
          <div className="space-y-4">
            {timeline.entries.map((entry, index) => (
              <div
                key={index}
                className="border-l-4 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors"
                style={{ borderColor: sentimentColors[entry.sentiment] }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        {new Date(entry.date).toLocaleDateString('tr-TR', { 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {entry.surveyTitle}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1">{entry.questionText}</p>
                    <p className="text-sm text-gray-600 italic mb-2">"{entry.answerValue}"</p>
                    <p className="text-sm text-gray-600">{entry.summary}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.emotions.slice(0, 3).map((emotion, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded"
                        >
                          {emotion.emotion} ({Math.round(emotion.intensity * 100)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: sentimentColors[entry.sentiment] }}
                    >
                      {entry.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
