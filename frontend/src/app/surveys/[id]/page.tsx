'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Survey } from '@/lib/api/surveys';
import Navbar from '@/components/Navbar';
import { SurveyDetailSkeleton } from '@/components/Skeletons';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navbar />
        <SurveyDetailSkeleton />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/surveys" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <span className="mr-2">←</span> Anketlere Dön
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {survey.title}
          </h1>
          <p className="text-gray-600 mb-6 text-lg">{survey.description}</p>
          <div className="flex items-center space-x-6 text-sm">
            <span className="flex items-center text-gray-600">
              <span className="text-lg mr-2">👤</span>
              <span className="font-medium">{survey.creator?.username}</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center text-gray-600">
              <span className="text-lg mr-2">📝</span>
              <span className="font-medium">{survey.questions?.length || 0} soru</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-red-800 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions?.map((question, index) => (
            <div key={question.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
