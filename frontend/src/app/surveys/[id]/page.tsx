'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Survey } from '@/lib/api/surveys';
import Navbar from '@/components/Navbar';
import { SurveyDetailSkeleton } from '@/components/Skeletons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SurveyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

    if (params.id) {
      loadSurvey(params.id as string);
    }
  }, [hydrated, user, params.id, router]);

  const loadSurvey = async (id: string) => {
    try {
      setLoading(true);
      const data = await surveysApi.getOne(id);
      setSurvey(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Anket yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!survey) return;

    // Zorunlu soruları kontrol et
    const requiredQuestions = survey.questions?.filter((q) => q.required) || [];
    const missingAnswers = requiredQuestions.filter((q) => !answers[q.id!]);

    if (missingAnswers.length > 0) {
      setError('Lütfen tüm zorunlu soruları cevaplayın');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await surveysApi.submitResponse(survey.id, {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      });
      setSuccess(true);
      setTimeout(() => router.push('/surveys'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cevaplar gönderilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <SurveyDetailSkeleton />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Anket bulunamadı</p>
          <Link href="/surveys" className="text-blue-600 hover:text-blue-700">
            ← Anketlere dön
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teşekkürler!</h2>
          <p className="text-gray-600">Cevaplarınız başarıyla kaydedildi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/surveys" className="inline-flex items-center text-primary hover:underline font-medium transition-colors">
            <span className="mr-2">←</span> Anketlere Dön
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{survey.title}</CardTitle>
            <CardDescription className="text-lg">{survey.description}</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="flex items-center space-x-6 text-sm">
            <span className="flex items-center text-gray-600">
              <span className="text-lg mr-2">👤</span>
              <span className="font-medium">{survey.creator?.username}</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center text-muted-foreground">
              <span className="text-lg mr-2">📝</span>
              <span className="font-medium">{survey.questions?.length || 0} soru</span>
            </span>
          </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions?.map((question, index) => (
            <Card key={question.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
              <div className="mb-4">
                <Label className="text-lg">
                  {index + 1}. {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </Label>
              </div>

              {question.type === 'TEXT' && (
                <Textarea
                  value={answers[question.id!] || ''}
                  onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                  rows={4}
                  placeholder="Cevabınızı yazın..."
                  required={question.required}
                />
              )}

              {question.type === 'RANGE' && (
                <div>
                  <input
                    type="range"
                    min={question.minValue || 1}
                    max={question.maxValue || 10}
                    value={answers[question.id!] || question.minValue || 1}
                    onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                    className="w-full"
                    required={question.required}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{question.minValue || 1}</span>
                    <span className="font-medium text-lg text-foreground">
                      {answers[question.id!] || question.minValue || 1}
                    </span>
                    <span>{question.maxValue || 10}</span>
                  </div>
                </div>
              )}

              {question.type === 'CHOICE' && (
                <div className="space-y-2">
                  {question.options?.map((option, i) => (
                    <label key={i} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id!] === option}
                        onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                        required={question.required}
                        className="text-blue-600"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'YESNO' && (
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent cursor-pointer flex-1">
                    <input
                      type="radio"
                      name={question.id}
                      value="Evet"
                      checked={answers[question.id!] === 'Evet'}
                      onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                      required={question.required}
                      className="text-blue-600"
                    />
                    <span className="text-gray-900">Evet</span>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent cursor-pointer flex-1">
                    <input
                      type="radio"
                      name={question.id}
                      value="Hayır"
                      checked={answers[question.id!] === 'Hayır'}
                      onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                      required={question.required}
                      className="text-blue-600"
                    />
                    <span className="text-gray-900">Hayır</span>
                  </label>
                </div>
              )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full text-lg"
              size="lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gönderiliyor...
                </span>
              ) : (
                '✓ Cevapları Gönder'
              )}
            </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
