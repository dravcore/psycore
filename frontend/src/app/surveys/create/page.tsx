'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { surveysApi, Question } from '@/lib/api/surveys';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/surveys" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <span className="mr-2">←</span> Anketlere Dön
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">📝 Yeni Anket Oluştur</h1>
            <p className="text-muted-foreground mt-2">Kendi psikolojik değerlendirme anketinizi oluşturun</p>
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
              <Label htmlFor="title">
                Anket Başlığı
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Psikolojik Değerlendirme Anketi"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">
                Açıklama
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Anket hakkında kısa bir açıklama yazın..."
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Sorular</h3>
                <Button
                  type="button"
                  onClick={addQuestion}
                  size="sm"
                >
                  <span className="text-lg mr-1">+</span> Soru Ekle
                </Button>
              </div>

              {questions.length === 0 ? (
                <Alert>
                  <AlertDescription className="text-center py-8">
                    <span className="text-5xl mb-4 block">📝</span>
                    <p className="font-medium mb-2">
                      Henüz soru eklenmedi
                    </p>
                    <p className="text-sm text-muted-foreground">
                      "Soru Ekle" butonuna tıklayarak başlayın
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            Soru {index + 1}
                          </span>
                          <Button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            variant="destructive"
                            size="sm"
                          >
                            Sil
                          </Button>
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

                          <Switch
                            checked={q.required}
                            onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                          />
                          <Label htmlFor="required">
                            Zorunlu
                          </Label>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Oluşturuluyor...
                  </span>
                ) : (
                  '✓ Anketi Oluştur'
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
              >
                <Link href="/surveys">
                  ← İptal
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
