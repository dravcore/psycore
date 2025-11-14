'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Survey } from '@/lib/api/surveys';

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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (params.id) {
      loadSurvey(params.id as string);
    }
  }, [user, params.id, router]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Teşekkürler!</h2>
          <p className="text-gray-600">Cevaplarınız başarıyla kaydedildi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                PsyCore
              </Link>
              <Link href="/surveys" className="text-gray-600 hover:text-gray-900">
                Anketler
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/surveys" className="text-blue-600 hover:text-blue-700">
            ← Geri
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          <p className="text-gray-600 mb-4">{survey.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>👤 {survey.creator?.username}</span>
            <span>•</span>
            <span>📝 {survey.questions?.length || 0} soru</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions?.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  {index + 1}. {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>

              {question.type === 'TEXT' && (
                <textarea
                  value={answers[question.id!] || ''}
                  onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{question.minValue || 1}</span>
                    <span className="font-medium text-lg">
                      {answers[question.id!] || question.minValue || 1}
                    </span>
                    <span>{question.maxValue || 10}</span>
                  </div>
                </div>
              )}

              {question.type === 'CHOICE' && (
                <div className="space-y-2">
                  {question.options?.map((option, i) => (
                    <label key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
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
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer flex-1">
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
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer flex-1">
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
            </div>
          ))}

          <div className="bg-white rounded-lg shadow p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {submitting ? 'Gönderiliyor...' : 'Cevapları Gönder'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
