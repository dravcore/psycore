import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full text-center space-y-8 animate-in fade-in duration-1000">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4 transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🧠</span>
            </div>
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent sm:text-7xl">
              PsyCore
            </h1>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto font-light">
              Yeni nesil psikolojik değerlendirme ve analiz platformu
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/login"
              className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Giriş Yap
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-50 border-2 border-blue-200 hover:border-blue-300 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Kayıt Ol
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-5xl">
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                Akıllı Değerlendirme
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yapılandırılmış anketler ve dinamik soru setleri ile kapsamlı psikolojik değerlendirme
              </p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🤖</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                AI Destekli Analiz
              </h3>
              <p className="text-gray-600 leading-relaxed">
                GPT-4 tabanlı metin analizi, duygu tanıma ve otomatik öngörü sistemleri
              </p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📈</div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">
                Detaylı Raporlama
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Görselleştirilmiş sonuç raporları, trendler ve karşılaştırmalı istatistikler
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 text-sm">Aktif Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600 text-sm">Tamamlanan Anket</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">95%</div>
              <div className="text-gray-600 text-sm">Memnuniyet</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
