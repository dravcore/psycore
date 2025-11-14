'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardApi, Timeline } from '@/lib/api/dashboard';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TimelinePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    loadTimeline();
  }, [hydrated, user, router]);

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

  if (!hydrated || !user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertDescription>
              <span className="text-xl mr-2">⚠️</span>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!timeline || timeline.entries.length === 0) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            📈 Ruh Hali Zaman Çizelgesi
          </h1>
          <p className="text-muted-foreground text-lg">
            {new Date(timeline.overallStats.dateRange.start).toLocaleDateString('tr-TR')} - {new Date(timeline.overallStats.dateRange.end).toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Kayıt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{timeline.overallStats.totalEntries}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Baskın Duygu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" style={{ color: sentimentColors[timeline.overallStats.dominantSentiment] }}>
                {timeline.overallStats.dominantSentiment === 'positive' && '😊 Pozitif'}
                {timeline.overallStats.dominantSentiment === 'negative' && '😢 Negatif'}
                {timeline.overallStats.dominantSentiment === 'neutral' && '😐 Nötr'}
                {timeline.overallStats.dominantSentiment === 'mixed' && '😕 Karışık'}
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En Sık Duygular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {timeline.overallStats.mostFrequentEmotions.slice(0, 5).map((emotion) => (
                  <span
                    key={emotion.emotion}
                    className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium"
                  >
                    {emotion.emotion} ({emotion.count})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Duygu Durumu Trendi</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Timeline Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Detaylı Kayıtlar</CardTitle>
          </CardHeader>
          <CardContent>
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
                          className="text-xs bg-muted text-foreground px-2 py-0.5 rounded"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
