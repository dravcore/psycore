'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Question } from '@/lib/api/surveys';
import Navbar from '@/components/Navbar';

export default function CreateSurveyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'TEXT',
        required: true,
        order: questions.length + 1,
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || questions.length === 0) {
      setError('Lütfen tüm alanları doldurun ve en az bir soru ekleyin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const survey = await surveysApi.create({
        title,
        description,
        questions: questions.map((q, i) => ({ ...q, order: i + 1 })),
      });
      router.push(`/surveys/${survey.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Anket oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/surveys" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <span className="mr-2">←</span> Anketlere Dön
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Yeni Anket Oluştur
            </h1>
            <p className="text-gray-600 mt-2">Kendi psikolojik değerlendirme anketinizi oluşturun</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anket Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Psikolojik Değerlendirme Anketi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Anket hakkında kısa bir açıklama yazın..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Sorular</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="text-lg mr-1">+</span> Soru Ekle
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <span className="text-5xl mb-4 block">📝</span>
                  <p className="text-gray-600 font-medium">
                    Henüz soru eklenmedi
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    "Soru Ekle" butonuna tıklayarak başlayın
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Soru {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Sil
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Soru metnini yazın..."
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="TEXT">Metin</option>
                            <option value="RANGE">Aralık (1-10)</option>
                            <option value="CHOICE">Çoktan Seçmeli</option>
                            <option value="YESNO">Evet/Hayır</option>
                          </select>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) =>
                                updateQuestion(index, 'required', e.target.checked)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Zorunlu</span>
                          </label>
                        </div>

                        {q.type === 'RANGE' && (
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              value={q.minValue || 1}
                              onChange={(e) =>
                                updateQuestion(index, 'minValue', parseInt(e.target.value))
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="Min değer"
                            />
                            <input
                              type="number"
                              value={q.maxValue || 10}
                              onChange={(e) =>
                                updateQuestion(index, 'maxValue', parseInt(e.target.value))
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="Max değer"
                            />
                          </div>
                        )}

                        {q.type === 'CHOICE' && (
                          <textarea
                            value={q.options?.join('\n') || ''}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                'options',
                                e.target.value.split('\n').filter((o) => o.trim())
                              )
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Her satıra bir seçenek yazın..."
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Oluşturuluyor...
                  </span>
                ) : (
                  '✓ Anketi Oluştur'
                )}
              </button>
              <Link
                href="/surveys"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                İptal
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
