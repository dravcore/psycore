'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Question } from '@/lib/api/surveys';

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

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/surveys" className="text-blue-600 hover:text-blue-700">
            ← Geri
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Anket Oluştur</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
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
                <h3 className="text-lg font-medium text-gray-900">Sorular</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  + Soru Ekle
                </button>
              </div>

              {questions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Henüz soru eklenmedi. "Soru Ekle" butonuna tıklayarak başlayın.
                </p>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
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
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Oluşturuluyor...' : 'Anketi Oluştur'}
              </button>
              <Link
                href="/surveys"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
