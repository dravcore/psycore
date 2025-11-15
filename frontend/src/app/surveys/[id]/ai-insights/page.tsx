'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { aiInsightsApi, AIInsights } from '@/lib/api/ai-insights';
import Navbar from '@/components/Navbar';
import { AIInsightsSkeleton } from '@/components/Skeletons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIInsightsPage() {
  const params = useParams();
  const surveyId = params.id as string;

  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInsights();
  }, [surveyId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await aiInsightsApi.getAIInsights(surveyId);
      setInsights(data);
    } catch (err: any) {
      console.error('AI Insights load error:', err);
      setError(err.response?.data?.message || 'AI analizleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'from-green-500 to-emerald-500';
      case 'negative':
        return 'from-red-500 to-rose-500';
      case 'neutral':
        return 'from-gray-500 to-slate-500';
      case 'mixed':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      case 'neutral':
        return '😐';
      case 'mixed':
        return '🤔';
      default:
        return '🎭';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'Pozitif';
      case 'negative':
        return 'Negatif';
      case 'neutral':
        return 'Nötr';
      case 'mixed':
        return 'Karışık';
      default:
        return sentiment;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AIInsightsSkeleton />
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

  if (!insights) return null;

  const totalSentiments = 
    insights.overallSentiment.positive +
    insights.overallSentiment.negative +
    insights.overallSentiment.neutral +
    insights.overallSentiment.mixed;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/surveys/${surveyId}/statistics`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← İstatistiklere Dön
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            🤖 AI Duygu Analizi
          </h1>
          <p className="text-muted-foreground text-lg">{insights.title}</p>
        </div>

        {/* No Text Responses */}
        {insights.totalTextResponses === 0 ? (
          <Alert>
            <AlertDescription className="text-center py-4">
              <span className="text-4xl mb-3 block">💬</span>
              <p className="font-medium mb-2">Bu ankette metin yanıtı bulunmuyor</p>
              <p className="text-sm text-muted-foreground">
                AI analizi sadece TEXT tipindeki sorular için yapılabilir.
              </p>
            </AlertDescription>
          </Alert>
        ) : insights.analyzedResponses === 0 ? (
          <Alert>
            <AlertDescription className="text-center py-4">
              <span className="text-4xl mb-3 block">⏳</span>
              <p className="font-medium mb-2">Analizler henüz tamamlanmadı</p>
              <p className="text-sm text-muted-foreground">
                {insights.totalTextResponses} metin yanıtı AI tarafından analiz ediliyor...
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Analiz Edilen</p>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {insights.analyzedResponses}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        / {insights.totalTextResponses} metin yanıtı
                      </p>
                    </div>
                    <div className="text-5xl">📊</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ortalama Güven</p>
                      <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                        {(insights.averageConfidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-5xl">🎯</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duygu Çeşidi</p>
                      <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                        {insights.commonEmotions.length}
                      </p>
                    </div>
                    <div className="text-5xl">🎭</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Summary */}
            {insights.aiSummary && (
              <Card className="mb-8 bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🤖</div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3">AI Özeti</h2>
                      <p className="text-lg leading-relaxed opacity-90">{insights.aiSummary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sentiment Distribution */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>📈 Genel Duygu Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {Object.entries(insights.overallSentiment).map(([sentiment, count]) => {
                  if (count === 0) return null;
                  const percentage = totalSentiments > 0 ? (count / totalSentiments) * 100 : 0;
                  return (
                    <div key={sentiment}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSentimentEmoji(sentiment)}</span>
                          <span className="font-medium">
                            {getSentimentText(sentiment)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{count}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getSentimentColor(sentiment)} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                </div>
              </CardContent>
            </Card>

            {/* Common Emotions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>💫 Yaygın Duygular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {insights.commonEmotions.slice(0, 10).map((emotion, index) => (
                    <Card key={emotion.emotion} className="hover:shadow-lg transition-all">
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{emotion.count}</p>
                        <p className="text-sm capitalize">{emotion.emotion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Keywords */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🔑 Anahtar Kelimeler</h2>
              <div className="flex flex-wrap gap-3">
                {insights.topKeywords.slice(0, 20).map((keyword) => (
                  <div
                    key={keyword.keyword}
                    className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full flex items-center gap-2 hover:shadow-md transition-all"
                  >
                    <span className="font-medium text-blue-700">{keyword.keyword}</span>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {keyword.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Analyses */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Detaylı Analizler</h2>
              <div className="space-y-6">
                {insights.analyses.map((analysis, index) => (
                  <div
                    key={analysis.answerId}
                    className="border-l-4 border-gray-300 pl-6 py-4 hover:border-blue-500 transition-colors"
                  >
                    {/* Question */}
                    <p className="text-sm text-gray-500 mb-2">{analysis.questionText}</p>

                    {/* Answer */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 italic">"{analysis.answerValue}"</p>
                    </div>

                    {/* Sentiment Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-4 py-2 rounded-full bg-gradient-to-r ${getSentimentColor(
                          analysis.sentiment
                        )} text-white font-medium flex items-center gap-2`}
                      >
                        <span>{getSentimentEmoji(analysis.sentiment)}</span>
                        {getSentimentText(analysis.sentiment)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Güven: {(analysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-700 mb-3">{analysis.summary}</p>

                    {/* Emotions */}
                    {analysis.emotions.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Duygular:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.emotions.map((emotion, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                            >
                              {emotion.emotion} ({(emotion.intensity * 100).toFixed(0)}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {analysis.keywords.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Anahtar Kelimeler:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
