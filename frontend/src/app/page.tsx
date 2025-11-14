import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
            PsyCore
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Psikolojik değerlendirme ve analiz platformu
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/login"
              className="px-6 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 text-lg font-medium text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Kayıt Ol
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-3xl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                📊 Değerlendirme
              </h3>
              <p className="text-gray-600 text-sm">
                Yapılandırılmış anketler ile psikolojik değerlendirme
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                🤖 AI Analiz
              </h3>
              <p className="text-gray-600 text-sm">
                GPT-4 destekli metin analizi ve通öngörü
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                📈 Raporlama
              </h3>
              <p className="text-gray-600 text-sm">
                Detaylı sonuç raporları ve istatistikler
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
