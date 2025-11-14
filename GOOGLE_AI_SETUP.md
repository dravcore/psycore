# 🤖 Google AI (Gemini) Entegrasyonu

PsyCore artık **Google AI Studio** kullanıyor! Ücretsiz ve cömert API limitleri var.

## 🎯 API Key Nasıl Alınır?

1. **Google AI Studio**'ya git: https://aistudio.google.com/apikey
2. Google hesabınla giriş yap
3. "Create API Key" butonuna tıkla
4. API key'ini kopyala

## ⚙️ Kurulum

1. API key'ini `.env` dosyasına ekle:

```bash
cd backend
nano .env
```

Şu satırı bul ve key'ini yapıştır:
```env
GOOGLE_AI_API_KEY="AIza..."
```

2. Backend'i yeniden başlat (otomatik olarak algılayacak)

## 📊 Özellikler

✅ **Tamamen Ücretsiz** - Günlük generous limit
✅ **Gemini 1.5 Flash** - Hızlı ve kaliteli
✅ **Türkçe Desteği** - Mükemmel Türkçe anlama
✅ **Sentiment Analysis** - Duygu analizi
✅ **Emotion Detection** - Emotion tespiti
✅ **Keyword Extraction** - Anahtar kelime çıkarma
✅ **AI Summaries** - Psikolojik içgörüler

## 🧪 Test Etmek İçin

1. TEXT sorusu içeren bir anket oluştur
2. Anketi doldur (Türkçe metin yanıtları yaz)
3. İstatistikler → "🤖 AI Analizi" butonuna tıkla
4. Gemini'nin analizini gör!

## 🔄 OpenAI'a Geri Dönmek İstersan

`.env` dosyasında:
```env
# GOOGLE_AI_API_KEY="..." 
OPENAI_API_KEY="sk-..."
```

Sistem otomatik olarak OPENAI_API_KEY varsa onu kullanacak.

## 💡 Limitler

Google AI Studio free tier:
- **15 requests/minute**
- **1500 requests/day**
- **1 million tokens/day**

Bizim kullanım için fazlasıyla yeterli! 🚀
