# 📘 PsyCore – Teknik Dokümantasyon

PsyCore, kullanıcıların verdiği cevaplar üzerinden **kişilik, duygu ve davranış analizleri** yapan yapay zekâ destekli bir psikometri platformudur.

Bu dokümantasyon, mimari, API, veri modeli, analiz motoru, CI/CD, güvenlik ve deployment dahil tüm teknik detayları içerir.

## 📑 İçindekiler

- [Ürün Tanımı](#ürün-tanimi)
- [Kurulum & Hızlı Başlangıç](#kurulum--hizli-başlangiç)
- [Veri Akışı Diyagramları](#veri-akişi-diyagramlari)
- [Sistem Mimarisi](#sistem-mimarisi)
- [Frontend Tasarımı](#frontend-tasarimi)
- [Backend API Tasarımı](#backend-api-tasarimi)
- [API Örnekleri & Test](#api-örnekleri--test)
- [Swagger/OpenAPI Dokümantasyonu](#swaggeropenapi-dokümantasyonu)
- [Veritabanı Tasarımı](#veritabani-tasarimi)
- [Migration Sistemi](#migration-sistemi)
- [Analiz Motoru](#analiz-motoru)
- [Performans & Skalabilite](#performans--skalabilite)
- [AI Model Detayları](#ai-model-detaylari)
- [Troubleshooting & Debug](#troubleshooting--debug)
- [Contributing Guidelines](#contributing-guidelines)
- [Deployment Senaryoları](#deployment-senaryolari)
- [Veri Gizliliği & KVKK/GDPR](#veri-gizliligi--kvkkgdpr)
- [Güvenlik ve Best Practices](#güvenlik-ve-best-practices)
- [Docker & Deployment](#docker--deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Roadmap](#roadmap)
- [Prisma Model Şeması](#prisma-model-şemasi)
- [API Response Examples](#api-response-examples)
- [Logging & Monitoring](#logging--monitoring)
- [Security Enhancements](#security-enhancements)
- [Proje Klasör Yapısı](#proje-klasör-yapisi)
- [Environment Variables](#environment-variables)

---

## Ürün Tanimi

## 1.1 Amaç

- Kişilik profili çıkarma (Big Five)
- Duygu sınıflandırma
- MBTI tahmini
- Zaman içinde duygu değişimi analizi
- Dashboard ile görsel raporlar üretme

## 1.2 Kullanıcı Rolleri

### 👤 User

- Soruları cevaplar
- Kendi analizlerini görür

### 🧠 Analyst

- Anonim verilerle çalışma
- Rapor çıkartma

### 🛡 Admin

- Soru yönetimi
- AI ayarları
- Kullanıcı yönetimi

---

## Kurulum & Hizli Başlangiç

### 2.1 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose
- pnpm veya npm

### 2.2 Lokal Kurulum

#### Backend Kurulumu

```bash
# Repo'yu clone edin
git clone https://github.com/dravcore/psycore.git
cd psycore/backend

# Bağımlılıkları yükleyin
pnpm install

# .env dosyasını oluşturun
cp .env.example .env

# Veritabanını başlatın
docker-compose up -d postgres

# Prisma migration'ları çalıştırın
pnpm prisma migrate dev

# Seed verilerini yükleyin (örnek sorular)
pnpm prisma db seed

# Development server'ı başlatın
pnpm start:dev
```

#### Frontend Kurulumu

```bash
cd ../frontend

# Bağımlılıkları yükleyin
pnpm install

# .env.local dosyasını oluşturun
cp .env.example .env.local

# Development server'ı başlatın
pnpm dev
```

### 2.3 Docker ile Kurulum

```bash
# Tüm servisleri başlatın
docker-compose up -d

# Migration'ları çalıştırın
docker-compose exec api pnpm prisma migrate deploy

# Seed verilerini yükleyin
docker-compose exec api pnpm prisma db seed
```

Uygulama şu adreslerde çalışacaktır:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger Docs: `http://localhost:3001/api/docs`

### 2.4 İlk Test

```bash
# Kullanıcı kaydı
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 2.5 Örnek .env Dosyası

```bash
# Database
DATABASE_URL="postgresql://psycore:password@localhost:5432/psycore_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4o"
OPENAI_MAX_TOKENS=1000

# Redis (opsiyonel)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# NextAuth (Frontend)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Cloudflare (Production)
CLOUDFLARE_API_TOKEN="your-token"
CLOUDFLARE_ZONE_ID="your-zone-id"
```

---

## Veri Akişi Diyagramlari

### 3.1 Kullanıcı Soru Cevaplama Akışı

```text
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │ 1. GET /questions
       ▼
┌──────────────────┐
│  API Gateway     │
│  (NestJS)        │
└──────┬───────────┘
       │ 2. Fetch questions
       ▼
┌──────────────────┐
│  PostgreSQL      │
│  (Questions)     │
└──────┬───────────┘
       │ 3. Return questions
       ▼
┌──────────────────┐
│  User answers    │
│  (Frontend Form) │
└──────┬───────────┘
       │ 4. POST /answers
       ▼
┌──────────────────┐
│  API Gateway     │
└──────┬───────────┘
       │ 5. Save answer
       ▼
┌──────────────────┐     ┌─────────────────┐
│  PostgreSQL      │────▶│ Analysis Queue  │
│  (Answers table) │     │ (Background Job)│
└──────────────────┘     └─────────────────┘
```

### 3.2 AI Analiz Pipeline (Hibrit Sistem)

**ÖNEMLI:** PsyCore iki tip soru-cevap sistemi kullanır:

#### A) Yapılandırılmış Sorular (Direkt Skorlama)

```text
Question Type: RANGE, CHOICE, YESNO
                    │
                    ▼
┌────────────────────────────────┐
│  Pre-defined scoring matrix    │
│  (weight × answer_value)       │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│  Instant Big Five calculation  │
│  No AI inference needed        │
└────────────────────────────────┘
```

**Örnek:**

```json
{
  "question": "Sosyal ortamlarda kendimi rahat hissederim",
  "type": "RANGE",
  "scale": "1-5",
  "weight": 0.8,
  "trait": "extraversion",
  "answer": 4,
  "score": 4 × 0.8 = 3.2
}
```

#### B) Açık Uçlu Sorular (AI ile Analiz)

```text
Question Type: TEXT (free text)
                    │
                    ▼
┌────────────────────────────────┐
│  User writes free text         │
│  "Stresle baş etme yöntemim..."│
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│  OpenAI GPT-4 Analysis         │
│  - Sentiment extraction        │
│  - Emotion classification      │
│  - Trait inference             │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│  Structured AI output          │
│  {                             │
│    "emotion": "CALM",          │
│    "traits": {                 │
│      "neuroticism": 0.3,       │
│      "openness": 0.7           │
│    },                          │
│    "confidence": 0.85          │
│  }                             │
└────────────────────────────────┘
```

#### C) Final Skorlama (Hibrit)

```text
┌─────────────────┐    ┌──────────────────┐
│ Structured      │    │ AI-analyzed      │
│ Questions       │    │ Free Text        │
│ (Direct score)  │    │ (Inferred score) │
└────────┬────────┘    └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
         ┌─────────────────────┐
         │  Weighted Average    │
         │  Final Trait Score   │
         │                      │
         │  Score = (Σ direct + │
         │          Σ AI) /     │
         │          total_count │
         └──────────────────────┘
```

### 3.3 Authentication Flow

```text
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. POST /auth/login
     ▼
┌─────────────────┐
│  Auth Service   │
│  - Validate     │
│  - Hash check   │
└────┬────────────┘
     │ 2. Valid?
     ▼
┌─────────────────┐
│  JWT Generator  │
│  - Access token │
│  - Refresh token│
└────┬────────────┘
     │ 3. Return tokens
     ▼
┌─────────────────┐
│  Frontend       │
│  - Store tokens │
│  - Set headers  │
└─────────────────┘
```

### 3.4 Real-time Emotion Timeline Update

```text
User answers → Save to DB → Trigger webhook
                                    │
                                    ▼
                            ┌───────────────┐
                            │ Calculate new │
                            │ emotion avg   │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │ Update Redis  │
                            │ cache         │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │ WebSocket     │
                            │ emit to user  │
                            └───────────────┘
```

---

## Sistem Mimarisi

### 2.1 Yüksek Seviye Mimari

```text
Next.js → NestJS API → PostgreSQL → AI Engine → Dashboard
```

### 2.2 Detaylı Bileşen Diyagramı

```text
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   FRONTEND    │ ---> │   BACKEND    │ ---> │  DATABASE     │
│ (Next.js)     │      │ (NestJS)     │      │ (PostgreSQL)  │
└──────────────┘      └──────────────┘      └──────────────┘
          │                     │
          ▼                     ▼
    UI / UX Layer          Analysis Engine
```

### 2.3 Teknoloji Stack

- **Frontend:** Next.js, Tailwind, shadcn/ui
- **Backend:** NestJS, Node.js, Prisma ORM
- **DB:** PostgreSQL (JSONB + relational)
- **AI:** GPT-5.1 + HuggingFace
- **DevOps:** Docker, Coolify, Traefik, Cloudflare

---

## Frontend Tasarimi

### 3.1 Sayfa Yapısı

- Login / Register
- Soru çözüm sayfaları
- Dashboard
- Profil
- Analiz raporu

### 3.2 Component Yapısı

- QuestionCard
- AnswerInput
- EmotionGraph
- PersonalityRadarChart
- StatsCard
- Navbar

### 3.3 UX İlkeleri

- Minimal tasarım
- Dikkat dağıtıcı yok
- Psikolojiye uygun mor–mavi tonları
- Yumuşak animasyonlu grafikler

---

## Backend API Tasarimi

### 4.1 Auth API

| Method | Endpoint       | Açıklama        |
| ------ | -------------- | --------------- |
| POST   | /auth/register | Yeni kullanıcı  |
| POST   | /auth/login    | JWT login       |
| GET    | /auth/me       | Token doğrulama |

### 4.2 Question API

| Method | Endpoint       | Açıklama     |
| ------ | -------------- | ------------ |
| GET    | /questions     | Soru listesi |
| GET    | /questions/:id | Soru detayı  |
| POST   | /questions     | Yeni soru    |

### 4.3 Answer API

| Method | Endpoint    | Açıklama               |
| ------ | ----------- | ---------------------- |
| POST   | /answers    | Cevap gönder           |
| GET    | /answers/me | Kullanıcının cevapları |

### 4.4 Analysis API

| Method | Endpoint              | Açıklama           |
| ------ | --------------------- | ------------------ |
| POST   | /analysis/emotion     | Duygu analizi      |
| POST   | /analysis/personality | Big Five           |
| GET    | /analysis/summary     | Dashboard verileri |

---

## API Örnekleri & Test

### 5.1 cURL Örnekleri

#### Kullanıcı Kaydı

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "username": "johndoe"
  }'
```

**Response (201):**

```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "username": "johndoe",
  "createdAt": "2025-11-14T10:00:00Z"
}
```

#### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 604800,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

#### Soru Listesi Getir

```bash
curl -X GET http://localhost:3001/questions?category=PERSONALITY&limit=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "q1-uuid",
      "text": "Sosyal ortamlarda kendimi rahat hissederim",
      "type": "RANGE",
      "category": "PERSONALITY",
      "weight": 0.8,
      "options": {
        "min": 1,
        "max": 5,
        "labels": ["Hiç katılmıyorum", "Tamamen katılıyorum"]
      }
    },
    {
      "id": "q2-uuid",
      "text": "Stresle nasıl baş edersiniz? (Açık uçlu)",
      "type": "TEXT",
      "category": "EMOTION",
      "weight": 1.0,
      "options": null
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### Cevap Gönder (Yapılandırılmış Soru)

```bash
curl -X POST http://localhost:3001/answers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q1-uuid",
    "numericScore": 4,
    "answerText": null
  }'
```

**Response (201):**

```json
{
  "id": "answer-uuid",
  "questionId": "q1-uuid",
  "userId": "user-uuid",
  "numericScore": 4,
  "calculatedScore": 3.2,
  "createdAt": "2025-11-14T10:05:00Z"
}
```

#### Cevap Gönder (Açık Uçlu - AI Analiz)

```bash
curl -X POST http://localhost:3001/answers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q2-uuid",
    "answerText": "Genellikle derin nefes alarak ve müzik dinleyerek sakinleşmeye çalışırım"
  }'
```

**Response (201):**

```json
{
  "id": "answer-uuid",
  "questionId": "q2-uuid",
  "userId": "user-uuid",
  "answerText": "Genellikle derin nefes alarak...",
  "emotion": "CALM",
  "aiAnalysis": {
    "sentiment": 0.65,
    "inferredTraits": {
      "neuroticism": 0.35,
      "openness": 0.70
    },
    "confidence": 0.82
  },
  "createdAt": "2025-11-14T10:06:00Z"
}
```

#### Analiz Özeti

```bash
curl -X GET http://localhost:3001/analysis/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response (200):**

```json
{
  "personality": {
    "openness": 0.72,
    "conscientiousness": 0.68,
    "extraversion": 0.45,
    "agreeableness": 0.78,
    "neuroticism": 0.38
  },
  "mbtiEstimate": "INFJ",
  "emotionTimeline": [
    {
      "date": "2025-11-10",
      "emotion": "JOY",
      "avgScore": 0.75
    },
    {
      "date": "2025-11-11",
      "emotion": "CALM",
      "avgScore": 0.65
    }
  ],
  "totalAnswers": 42,
  "lastUpdated": "2025-11-14T10:00:00Z"
}
```

### 5.2 HTTP Durum Kodları

| Kod | Açıklama | Örnek Senaryo |
| --- | --- | --- |
| 200 | OK | Başarılı GET/PUT |
| 201 | Created | Başarılı POST |
| 400 | Bad Request | Geçersiz JSON, eksik alan |
| 401 | Unauthorized | Token eksik/geçersiz |
| 403 | Forbidden | Yetkisiz erişim |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | Email zaten kayıtlı |
| 429 | Too Many Requests | Rate limit aşıldı |
| 500 | Internal Server Error | Beklenmeyen hata |

### 5.3 Hata Response Formatı

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2025-11-14T10:00:00Z",
  "path": "/auth/register"
}
```

### 5.4 Rate Limiting

- **Auth endpoints:** 5 requests / dakika / IP
- **Questions:** 30 requests / dakika / kullanıcı
- **Answers:** 20 requests / dakika / kullanıcı
- **Analysis:** 10 requests / dakika / kullanıcı

Rate limit aşıldığında:

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "retryAfter": 45
}
```

### 5.5 Pagination

Tüm liste endpoint'leri pagination destekler:

```bash
GET /questions?page=2&limit=20&sortBy=createdAt&order=desc
```

Response:

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 5.6 Test Komutları

#### Unit Tests

```bash
# Backend
cd backend
pnpm test

# Specific test file
pnpm test auth.service.spec.ts

# Coverage
pnpm test:cov
```

#### Integration Tests

```bash
# E2E tests
pnpm test:e2e

# Specific scenario
pnpm test:e2e -- --grep "Auth flow"
```

#### Frontend Tests

```bash
cd frontend
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### 5.7 Test Örneği (Jest)

```typescript
describe('AnswerService', () => {
  it('should calculate score for structured question', async () => {
    const answer = {
      questionId: 'q1',
      numericScore: 4,
      weight: 0.8
    };
    
    const result = await answerService.calculateScore(answer);
    
    expect(result.calculatedScore).toBe(3.2);
    expect(result.requiresAI).toBe(false);
  });

  it('should trigger AI analysis for text question', async () => {
    const answer = {
      questionId: 'q2',
      answerText: 'I handle stress by meditating'
    };
    
    const result = await answerService.processAnswer(answer);
    
    expect(result.aiAnalysis).toBeDefined();
    expect(result.aiAnalysis.emotion).toBe('CALM');
    expect(result.requiresAI).toBe(true);
  });
});
```

---

## Swagger/OpenAPI Dokümantasyonu

PsyCore API'si, NestJS ile **Swagger (OpenAPI 3.1)** kullanılarak tamamen dokümante edilmelidir.

### 5.1 Swagger Kurulumu (main.ts)

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('PsyCore API')
    .setDescription('PsyCore kişilik & duygu analizi API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

Swagger UI adresi:

```text
/api/docs
```

### 5.2 Örnek OpenAPI Tanımı

```yaml
openapi: 3.1.0
info:
  title: PsyCore API
  version: 1.0.0
```

---

## Veritabani Tasarimi

### 6.1 ERD Diyagramı

```mermaid
erDiagram
    User ||--o{ Answer
    Question ||--o{ Answer
    User ||--|| PersonalityProfile
    User ||--o{ EmotionHistory
```

### 6.2 Index Tasarımı

#### Answer

- userId
- questionId
- userId + questionId
- createdAt

#### EmotionHistory

- userId + timestamp
- emotion

---

## Migration Sistemi

### 7.1 Klasör Yapısı

```text
prisma/
  schema.prisma
  migrations/
```

### 7.2 Komutlar

- Yeni migration: `npx prisma migrate dev`
- Prod deploy: `npx prisma migrate deploy`
- Seed: `npx prisma db seed`

---

## Analiz Motoru

### 8.1 Duygu Analizi Çıktısı

```json
{
  "emotion": "JOY",
  "sentimentScore": 0.74,
  "intensity": "medium"
}
```

### 8.2 Big Five Hesabı

```text
TraitScore = Σ(answerScore × weight) / questionCount
```

### 8.3 MBTI Tahmini

- GPT-5.1 temelli bilişsel analiz
- E/I — S/N — T/F — J/P skorları

### 8.4 Timeline Analizi

```text
DailyMood = AVG(emotion_score per day)
```

---

## AI Model Detaylari

### 9.1 OpenAI GPT-4 Kullanımı

#### Model Seçimi

```typescript
const OPENAI_CONFIG = {
  model: 'gpt-4o',           // GPT-4 Optimized
  maxTokens: 1000,           // Maksimum output
  temperature: 0.3,          // Düşük = tutarlı sonuçlar
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0
};
```

**Model Kararı:**

- `gpt-4o`: En güncel, hızlı ve uygun maliyetli
- `gpt-4-turbo`: Alternatif (daha yavaş ama biraz daha ucuz)
- `gpt-3.5-turbo`: Fallback için (hızlı ama daha az doğru)

### 9.2 Prompt Engineering Stratejisi

#### Duygu Analizi Prompt

```typescript
const emotionAnalysisPrompt = `
Sen bir psikoloji uzmanısın. Aşağıdaki metni analiz et ve kullanıcının:
1. Ana duygu durumunu (JOY, SADNESS, ANGER, FEAR, SURPRISE, CALM)
2. Sentiment skorunu (-1 ile 1 arası)
3. Duygu yoğunluğunu (low, medium, high)
belirle.

Kullanıcı metni: "${userText}"

Yanıtını sadece JSON formatında ver:
{
  "emotion": "emotion_name",
  "sentimentScore": 0.0,
  "intensity": "level",
  "confidence": 0.0
}
`;
```

#### Kişilik Trait Çıkarımı Prompt

```typescript
const traitInferencePrompt = `
Sen bir Big Five kişilik analiz uzmanısın. Aşağıdaki kullanıcı cevabını analiz et ve 
Big Five trait skorlarını 0-1 arası tahmin et:

- Openness (Deneyime açıklık)
- Conscientiousness (Sorumluluk)
- Extraversion (Dışadönüklük)
- Agreeableness (Uyumluluk)
- Neuroticism (Duygusal dengesizlik)

Kullanıcı cevabı: "${userAnswer}"

JSON formatında yanıt ver:
{
  "traits": {
    "openness": 0.0,
    "conscientiousness": 0.0,
    "extraversion": 0.0,
    "agreeableness": 0.0,
    "neuroticism": 0.0
  },
  "reasoning": "kısa açıklama",
  "confidence": 0.0
}
`;
```

#### MBTI Tahmini Prompt

```typescript
const mbtiPrompt = `
Kullanıcının tüm cevaplarına bakarak MBTI tipini tahmin et.
Toplam ${answerCount} cevap var.

Big Five skorları:
- Openness: ${scores.openness}
- Conscientiousness: ${scores.conscientiousness}
- Extraversion: ${scores.extraversion}
- Agreeableness: ${scores.agreeableness}
- Neuroticism: ${scores.neuroticism}

Örnek cevaplar:
${sampleAnswers.join('\n')}

JSON formatında yanıt:
{
  "mbtiType": "XXXX",
  "dimensions": {
    "EI": 0.0,
    "SN": 0.0,
    "TF": 0.0,
    "JP": 0.0
  },
  "confidence": 0.0
}
`;
```

### 9.3 Token Kullanımı & Maliyet Optimizasyonu

#### Token Hesaplama

```typescript
import { encoding_for_model } from 'tiktoken';

function estimateTokens(text: string): number {
  const encoder = encoding_for_model('gpt-4');
  const tokens = encoder.encode(text);
  return tokens.length;
}

// Örnek
const prompt = emotionAnalysisPrompt;
const inputTokens = estimateTokens(prompt); // ~150 tokens
const outputTokens = 100; // JSON response ~100 tokens
const totalTokens = inputTokens + outputTokens; // ~250 tokens
```

#### Maliyet Tablosu (GPT-4o)

| İşlem | Input Tokens | Output Tokens | Maliyet/Request |
| --- | --- | --- | --- |
| Duygu analizi | 150 | 100 | $0.00125 |
| Trait çıkarımı | 200 | 150 | $0.00175 |
| MBTI tahmini | 500 | 200 | $0.00350 |

**Aylık Tahmin (10,000 kullanıcı, 50 soru/kullanıcı):**

- Toplam AI analiz: ~100,000 request
- Ortalama maliyet: $150-200/ay

#### Optimizasyon Teknikleri

```typescript
// 1. Batch processing
async function analyzeMultipleAnswers(answers: string[]) {
  const combinedPrompt = `
    Aşağıdaki ${answers.length} cevabı toplu analiz et:
    ${answers.map((a, i) => `${i+1}. ${a}`).join('\n')}
  `;
  // Tek API çağrısı yerine batch
}

// 2. Cache AI responses
const cacheKey = `ai:${hash(userText)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const aiResponse = await openai.analyze(userText);
await redis.set(cacheKey, JSON.stringify(aiResponse), 'EX', 3600);

// 3. Throttle AI calls
const queue = new PQueue({ concurrency: 5 }); // Max 5 parallel
await queue.add(() => openai.analyze(text));
```

### 9.4 Fallback Mekanizmaları

```typescript
async function analyzeWithFallback(text: string) {
  try {
    // Primary: GPT-4o
    return await openai.analyze(text, { model: 'gpt-4o' });
  } catch (error) {
    if (error.code === 'rate_limit_exceeded') {
      // Fallback 1: GPT-3.5-turbo
      console.warn('GPT-4 rate limit, falling back to GPT-3.5');
      return await openai.analyze(text, { model: 'gpt-3.5-turbo' });
    }
    
    if (error.code === 'service_unavailable') {
      // Fallback 2: Rule-based simple analysis
      console.warn('OpenAI unavailable, using rule-based');
      return ruleBasedAnalysis(text);
    }
    
    throw error;
  }
}

// Rule-based fallback (basit regex/keyword matching)
function ruleBasedAnalysis(text: string) {
  const keywords = {
    joy: ['mutlu', 'güzel', 'harika', 'sevindim'],
    sadness: ['üzgün', 'kötü', 'mutsuz'],
    anger: ['sinir', 'kızgın', 'öfke']
  };
  
  // Basit keyword matching
  // Sadece acil durumlarda kullanılır
}
```

### 9.5 Model Versiyonlama

```typescript
// Database'de model versiyonu sakla
interface AIAnalysisRecord {
  id: string;
  answerId: string;
  result: object;
  modelVersion: string;      // "gpt-4o-2024-11"
  promptVersion: string;      // "v2.3"
  tokensUsed: number;
  latency: number;
  createdAt: Date;
}

// Migration senaryosu
async function reanalyzeWithNewModel() {
  const oldAnalyses = await prisma.aiAnalysis.findMany({
    where: { modelVersion: 'gpt-3.5-turbo' }
  });
  
  for (const analysis of oldAnalyses) {
    // Yeni model ile yeniden analiz et
    const newResult = await openai.analyze(
      analysis.originalText,
      { model: 'gpt-4o' }
    );
    
    await prisma.aiAnalysis.update({
      where: { id: analysis.id },
      data: { 
        result: newResult,
        modelVersion: 'gpt-4o'
      }
    });
  }
}
```

### 9.6 Retry & Error Handling

```typescript
import retry from 'async-retry';

async function robustAICall(text: string) {
  return await retry(
    async (bail) => {
      try {
        return await openai.analyze(text);
      } catch (error) {
        // Retry yapmayacağımız hatalar
        if (error.code === 'invalid_api_key') {
          bail(error); // Hemen çık
          return;
        }
        
        // Tekrar denenebilir hatalar
        if (error.code === 'rate_limit_exceeded') {
          throw error; // Retry yapılacak
        }
        
        throw error;
      }
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000
    }
  );
}
```

---

## Troubleshooting & Debug

### 10.1 Yaygın Hatalar ve Çözümleri

#### Hata: "Connection refused - PostgreSQL"

```bash
# Sorun: PostgreSQL çalışmıyor
docker ps | grep postgres

# Çözüm 1: Container'ı yeniden başlat
docker-compose restart postgres

# Çözüm 2: Port çakışması kontrolü
lsof -i :5432

# Çözüm 3: Volume temizle
docker-compose down -v
docker-compose up -d
```

#### Hata: "OpenAI API rate limit exceeded"

```typescript
// Çözüm: Exponential backoff implement et
const response = await retry(
  () => openai.analyze(text),
  { retries: 3, backoff: 'exponential' }
);
```

#### Hata: "JWT token expired"

```bash
# Kontrol: Token expiration süresini kontrol et
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Çözüm: Refresh token kullan
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

#### Hata: "Prisma migration failed"

```bash
# Reset database
pnpm prisma migrate reset

# Force migration
pnpm prisma migrate deploy --force

# Check migration status
pnpm prisma migrate status
```

### 10.2 Debug Modu Aktifleştirme

#### Backend Debug

```bash
# .env dosyasına ekle
LOG_LEVEL=debug
DEBUG=prisma:*,nestjs:*

# NestJS debug mode
pnpm start:debug

# Browser'da: chrome://inspect
```

#### Prisma Query Logging

```typescript
// prisma/client.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' }
  ]
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

#### OpenAI Request Logging

```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'X-Request-ID': generateRequestId()
  }
});

// Log tüm API çağrılarını
openai.on('request', (req) => {
  logger.debug('OpenAI Request', {
    model: req.model,
    tokens: req.maxTokens
  });
});
```

### 10.3 Log Analizi

#### Structured Logging (Pino)

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Kullanım
logger.info({ userId: user.id, action: 'login' }, 'User logged in');
logger.error({ error: err, context: 'ai-analysis' }, 'AI analysis failed');
```

#### Log Filtreleme

```bash
# Sadece hata logları
pnpm start:dev 2>&1 | grep ERROR

# Belirli bir user'ın logları
pnpm start:dev 2>&1 | grep "userId.*abc123"

# Yavaş query'leri bul (>100ms)
cat logs/app.log | grep "Duration" | awk '$2 > 100'
```

### 10.4 Performance Profiling

#### Node.js Profiling

```bash
# CPU profiling
node --prof dist/main.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --inspect dist/main.js
# Chrome DevTools -> Memory tab
```

#### Database Query Performance

```sql
-- Yavaş query'leri tespit et
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index kullanımını kontrol et
EXPLAIN ANALYZE
SELECT * FROM answers WHERE user_id = 'uuid';
```

### 10.5 Health Check Endpoints

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
  
  @Get('db')
  async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy' };
    } catch (error) {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }
  
  @Get('redis')
  async checkRedis() {
    try {
      await redis.ping();
      return { status: 'healthy' };
    } catch (error) {
      throw new ServiceUnavailableException('Redis unavailable');
    }
  }
  
  @Get('ai')
  async checkOpenAI() {
    try {
      await openai.models.retrieve('gpt-4o');
      return { status: 'healthy' };
    } catch (error) {
      throw new ServiceUnavailableException('OpenAI unavailable');
    }
  }
}
```

---

## Contributing Guidelines

### 11.1 Git Workflow (Git Flow)

```text
main (production)
  └── develop (staging)
       ├── feature/user-authentication
       ├── feature/ai-analysis
       ├── bugfix/login-error
       └── hotfix/security-patch
```

#### Branch Naming Convention

```bash
# Feature branches
git checkout -b feature/big-five-calculation

# Bug fixes
git checkout -b bugfix/jwt-expiration

# Hotfixes (critical production bugs)
git checkout -b hotfix/rate-limit-bypass

# Refactoring
git checkout -b refactor/prisma-queries
```

### 11.2 Commit Message Formatı

**Format:** `<type>(<scope>): <subject>`

```bash
# Örnekler
git commit -m "feat(auth): add refresh token rotation"
git commit -m "fix(analysis): resolve Big Five calculation bug"
git commit -m "docs(readme): update API examples"
git commit -m "perf(db): add index on answers table"
git commit -m "refactor(ai): extract prompt templates"
git commit -m "test(auth): add e2e login tests"
```

**Types:**

- `feat`: Yeni feature
- `fix`: Bug fix
- `docs`: Dokümantasyon
- `style`: Code formatting (logic değişmez)
- `refactor`: Code refactoring
- `perf`: Performance iyileştirme
- `test`: Test ekleme/düzenleme
- `chore`: Build, dependencies
- `ci`: CI/CD değişiklikleri
- `build`: Build system değişiklikleri

**Scopes (Örnekler):**

- `auth`: Authentication/Authorization
- `api`: API endpoints
- `db`: Database
- `ui`: User Interface
- `ai`: AI/ML features
- `docs`: Documentation
- `deps`: Dependencies

#### Detaylı Örnekler

```bash
# Feature ekleme
git commit -m "feat(auth): add JWT refresh token rotation"
git commit -m "feat(analysis): implement MBTI personality calculation"
git commit -m "feat(ui): add emotion timeline chart component"

# Bug fix
git commit -m "fix(api): resolve rate limiting bypass issue"
git commit -m "fix(db): fix N+1 query in answers endpoint"
git commit -m "fix(ai): handle OpenAI timeout errors"

# Documentation
git commit -m "docs(readme): add API usage examples"
git commit -m "docs(api): update Swagger annotations"
git commit -m "docs(contributing): add git workflow guide"

# Performance
git commit -m "perf(db): add composite index on answers table"
git commit -m "perf(cache): implement Redis caching for analysis results"
git commit -m "perf(api): optimize Big Five calculation algorithm"

# Refactoring
git commit -m "refactor(ai): extract prompt templates to constants"
git commit -m "refactor(services): split analysis service into modules"
git commit -m "refactor(db): migrate to Prisma from TypeORM"

# Tests
git commit -m "test(auth): add e2e login flow tests"
git commit -m "test(analysis): add unit tests for scoring algorithm"
git commit -m "test(api): add integration tests for question endpoints"

# Chore
git commit -m "chore(deps): update dependencies to latest versions"
git commit -m "chore(docker): update Docker Compose configuration"
git commit -m "chore(lint): fix ESLint warnings"

# CI/CD
git commit -m "ci(github): add automated testing workflow"
git commit -m "ci(deploy): configure Coolify deployment"
git commit -m "ci(docker): optimize build cache layers"

# Breaking changes (!)
git commit -m "feat(api)!: change response format for analysis endpoint"
git commit -m "refactor(db)!: rename User model fields"

# Multi-line commit (detaylı açıklama)
git commit -m "feat(ai): add GPT-4 fallback mechanism

- Add retry logic with exponential backoff
- Implement fallback to GPT-3.5-turbo
- Add rule-based analysis as last resort
- Update error handling and logging

Closes #123"
```

#### Commit Kuralları

- ✅ Subject küçük harfle başlar
- ✅ Subject nokta ile bitmez
- ✅ Imperative mood kullan ("add" değil "added")
- ✅ 50 karakter veya daha kısa subject
- ✅ Body varsa 72 karakter satır limiti
- ✅ Breaking change için `!` kullan
- ✅ Issue reference ekle (Closes #123)

#### Hatalı Örnekler

```bash
# ❌ Kötü
git commit -m "fixed bug"
git commit -m "Updated files"
git commit -m "WIP"
git commit -m "asdasd"

# ✅ İyi
git commit -m "fix(auth): resolve JWT expiration issue"
git commit -m "docs(readme): update installation guide"
git commit -m "feat(analysis): add emotion detection"
```

### 11.3 Pull Request Template

```markdown
## Açıklama
Bu PR'da neler yapıldı? (kısa özet)

## Değişiklikler
- [ ] Yeni feature eklendi
- [ ] Bug fix
- [ ] Performance iyileştirmesi
- [ ] Refactoring
- [ ] Dokümantasyon

## Test Edildi mi?
- [ ] Unit testler yazıldı
- [ ] E2E testler yazıldı
- [ ] Manuel test yapıldı
- [ ] Local'de çalıştırıldı

## Ekran Görüntüleri
(Varsa UI değişikliklerinin ekran görüntüleri)

## Checklist
- [ ] Code lint'ten geçiyor (`pnpm lint`)
- [ ] Testler başarılı (`pnpm test`)
- [ ] Branch güncel (`git pull origin develop`)
- [ ] Commit mesajları convention'a uygun

## İlgili Issue
Closes #123
```

### 11.4 Code Review Süreci

#### Review Checklist

- [ ] **Kod kalitesi:** Clean code prensipleri uygulanmış mı?
- [ ] **Testler:** Yeterli test coverage var mı? (%80+)
- [ ] **Performance:** N+1 query, memory leak yok mu?
- [ ] **Security:** SQL injection, XSS riskleri kontrol edildi mi?
- [ ] **Documentation:** Yeni API'ler dokümante edildi mi?
- [ ] **Breaking changes:** Backward compatibility bozuldu mu?

#### Review Yorumları

```text
💡 Öneri (optional)
⚠️ Dikkat (should fix)
🚨 Kritik (must fix)
✅ Onaylandı
```

### 11.5 Code Standards

#### TypeScript Style Guide

```typescript
// ✅ İyi
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

async function getUserById(id: string): Promise<User> {
  return await prisma.user.findUnique({ where: { id } });
}

// ❌ Kötü
interface user {
  ID: string;
  Email: string;
}

function getUser(id) {
  return prisma.user.findUnique({ where: { id } });
}
```

#### ESLint Configuration

```json
{
  "extends": [
    "@nestjs/eslint-config",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### 11.6 Testing Requirements

```bash
# PR merge için minimum gereksinimler
pnpm test                    # Tüm testler başarılı
pnpm test:cov                # Coverage >= 80%
pnpm lint                    # Lint hatasız
pnpm build                   # Build başarılı
```

---

## Deployment Senaryolari

### 12.1 Local Development

```bash
# Backend
cd backend
pnpm install
cp .env.example .env
docker-compose up -d postgres redis
pnpm prisma migrate dev
pnpm prisma db seed
pnpm start:dev

# Frontend
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

**Çalışma Ortamı:**

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- Database: `localhost:5432`
- Redis: `localhost:6379`

### 12.2 Staging Environment

```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  api:
    image: psycore/api:staging
    environment:
      NODE_ENV: staging
      DATABASE_URL: ${STAGING_DB_URL}
      REDIS_URL: ${STAGING_REDIS_URL}
    deploy:
      replicas: 2
      
  web:
    image: psycore/web:staging
    environment:
      NEXT_PUBLIC_API_URL: https://staging-api.psycore.com
```

**Deployment:**

```bash
# Build images
docker build -t psycore/api:staging ./backend
docker build -t psycore/web:staging ./frontend

# Push to registry
docker push psycore/api:staging
docker push psycore/web:staging

# Deploy
ssh staging-server
cd /opt/psycore
git pull origin develop
docker-compose -f docker-compose.staging.yml up -d

# Run migrations
docker-compose exec api pnpm prisma migrate deploy
```

### 12.3 Production Deployment

#### Blue-Green Deployment

```text
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       │
       ├─────────┐
       │         │
  ┌────▼────┐  ┌▼────────┐
  │ Blue    │  │ Green   │
  │ (Live)  │  │ (Idle)  │
  └─────────┘  └─────────┘
```

**Deployment Steps:**

```bash
# 1. Green environment'a deploy et
docker-compose -f docker-compose.green.yml up -d

# 2. Health check
curl https://green.psycore.com/health

# 3. Smoke tests
pnpm test:e2e --env=green

# 4. Load balancer'ı green'e yönlendir
kubectl set selector service/psycore app=green

# 5. Blue environment'ı izle (rollback için hazır)
# 10 dakika bekle...

# 6. Sorun yoksa blue'yu kapat
docker-compose -f docker-compose.blue.yml down
```

#### Zero-Downtime Migration

```typescript
// Migration strategy
export async function safeDbMigration() {
  // 1. Yeni kolonu ekle (nullable)
  await prisma.$executeRaw`
    ALTER TABLE users ADD COLUMN new_field VARCHAR NULL;
  `;
  
  // 2. Veriyi kopyala (background job)
  await copyDataToNewColumn();
  
  // 3. App'i deploy et (her iki kolonu da oku)
  await deployNewVersion();
  
  // 4. Eski kolonu kaldır
  await prisma.$executeRaw`
    ALTER TABLE users DROP COLUMN old_field;
  `;
}
```

### 12.4 Rollback Stratejisi

```bash
# Hızlı rollback (önceki imaja dön)
kubectl rollout undo deployment/psycore-api

# Belirli bir revizyona dön
kubectl rollout history deployment/psycore-api
kubectl rollout undo deployment/psycore-api --to-revision=3

# Database rollback (migration geri al)
pnpm prisma migrate resolve --rolled-back 20231114_add_field
```

### 12.5 Monitoring & Alerting (Production)

```yaml
# prometheus-alerts.yml
groups:
  - name: psycore
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        annotations:
          summary: "High error rate detected"
          
      - alert: SlowAPIResponse
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        annotations:
          summary: "API response time > 1s"
          
      - alert: DatabaseDown
        expr: up{job="postgresql"} == 0
        annotations:
          summary: "PostgreSQL is down"
```

### 12.6 Backup & Disaster Recovery

```bash
# Daily automated backup
0 2 * * * /opt/scripts/backup-db.sh

# backup-db.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > /backups/psycore_$DATE.sql.gz

# Retention: 30 günlük backup tut
find /backups -name "psycore_*.sql.gz" -mtime +30 -delete

# S3'e yükle
aws s3 cp /backups/psycore_$DATE.sql.gz s3://psycore-backups/
```

**Recovery:**

```bash
# Backup'tan restore
gunzip -c psycore_20251114.sql.gz | psql $DATABASE_URL
```

---

## Veri Gizliligi & KVKK/GDPR

### 13.1 Kişisel Veri İşleme Politikası

#### İşlenen Veriler

| Veri Tipi | Amaç | Saklama Süresi | Yasal Dayanak |
| --- | --- | --- | --- |
| Email, şifre | Kimlik doğrulama | Hesap silinene kadar | Sözleşme |
| Soru cevapları | Analiz | 2 yıl | Açık rıza |
| Kişilik skorları | Raporlama | 2 yıl | Açık rıza |
| IP adresi | Güvenlik | 6 ay | Meşru menfaat |
| Log kayıtları | Hata ayıklama | 90 gün | Meşru menfaat |

#### Veri İşleme Prensipleri

```typescript
// 1. Data Minimization (Sadece gerekli veri topla)
interface UserRegistration {
  email: string;
  password: string;
  // ❌ Gereksiz: phoneNumber, address, birthDate
}

// 2. Purpose Limitation (Amacı dışında kullanma)
const answers = await getAnswers(userId);
// ✅ İyi: Analiz için kullan
await analyzePersonality(answers);
// ❌ Kötü: Marketing için kullan
await sendMarketingEmail(answers);

// 3. Storage Limitation (Gereksiz veri saklama)
// 2 yıldan eski cevapları otomatik sil
await prisma.answer.deleteMany({
  where: {
    createdAt: { lt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000) }
  }
});
```

### 13.2 Kullanıcı Hakları (KVKK/GDPR)

#### Right to Access (Erişim Hakkı)

```typescript
// GET /user/data-export
@Get('data-export')
async exportUserData(@CurrentUser() user: User) {
  const data = {
    profile: await prisma.user.findUnique({ where: { id: user.id } }),
    answers: await prisma.answer.findMany({ where: { userId: user.id } }),
    personality: await prisma.personalityProfile.findUnique({ 
      where: { userId: user.id } 
    }),
    emotionHistory: await prisma.emotionHistory.findMany({ 
      where: { userId: user.id } 
    })
  };
  
  // JSON veya CSV olarak indir
  return data;
}
```

#### Right to Erasure (Silinme Hakkı)

```typescript
// DELETE /user/delete-account
@Delete('delete-account')
async deleteAccount(@CurrentUser() user: User) {
  // 1. Tüm kişisel verileri sil
  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { userId: user.id } }),
    prisma.emotionHistory.deleteMany({ where: { userId: user.id } }),
    prisma.personalityProfile.delete({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } })
  ]);
  
  // 2. Redis cache temizle
  await redis.del(`analysis:${user.id}`);
  
  // 3. Backup'larda anonymize et (30 gün içinde)
  await scheduleBackupAnonymization(user.id);
  
  return { message: 'Account deleted successfully' };
}
```

#### Right to Rectification (Düzeltme Hakkı)

```typescript
// PATCH /user/profile
@Patch('profile')
async updateProfile(@CurrentUser() user: User, @Body() data: UpdateProfileDto) {
  return await prisma.user.update({
    where: { id: user.id },
    data: {
      email: data.email,
      username: data.username,
      updatedAt: new Date()
    }
  });
}
```

### 13.3 Data Anonymization

```typescript
// Anonim veri setleri (araştırma için)
async function anonymizeDataset() {
  const answers = await prisma.answer.findMany({
    select: {
      questionId: true,
      answerText: true,
      numericScore: true,
      emotion: true,
      // ❌ userId dahil etme
    }
  });
  
  return answers.map(a => ({
    ...a,
    anonymousId: hashUserId(a.userId), // One-way hash
    timestamp: roundToHour(a.createdAt) // Zaman hassasiyetini azalt
  }));
}
```

### 13.4 Consent Management

```typescript
interface UserConsent {
  userId: string;
  consentType: 'analysis' | 'marketing' | 'research';
  granted: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  ipAddress: string;
}

// Rıza kaydı
async function recordConsent(userId: string, type: string) {
  await prisma.consent.create({
    data: {
      userId,
      consentType: type,
      granted: true,
      grantedAt: new Date(),
      ipAddress: req.ip
    }
  });
}

// Rıza kontrolü
async function checkConsent(userId: string, type: string): Promise<boolean> {
  const consent = await prisma.consent.findFirst({
    where: {
      userId,
      consentType: type,
      granted: true,
      revokedAt: null
    }
  });
  
  return !!consent;
}
```

### 13.5 Data Breach Protocol

```typescript
// Veri ihlali tespit edildiğinde
async function handleDataBreach(incident: DataBreachIncident) {
  // 1. Log kaydet
  logger.critical('Data breach detected', { 
    type: incident.type,
    affectedUsers: incident.userCount 
  });
  
  // 2. Etkilenen kullanıcıları belirle
  const affectedUsers = await identifyAffectedUsers(incident);
  
  // 3. 72 saat içinde KVKK Kurumu'na bildir
  await notifyDataProtectionAuthority(incident);
  
  // 4. Kullanıcıları bilgilendir
  for (const user of affectedUsers) {
    await sendBreachNotification(user.email, {
      date: incident.date,
      dataTypes: incident.affectedDataTypes,
      actions: 'Şifrenizi değiştirmenizi öneriyoruz'
    });
  }
  
  // 5. Güvenlik önlemleri al
  await applySecurityPatch(incident.vulnerability);
}
```

### 13.6 Cookie Policy

```typescript
// Frontend cookie consent
const cookieConsent = {
  necessary: true,        // Always enabled (auth)
  analytics: false,       // Optional (Google Analytics)
  marketing: false        // Optional (ads)
};

// Cookie banner
function CookieBanner() {
  const [consent, setConsent] = useState(cookieConsent);
  
  const handleAccept = async () => {
    await fetch('/api/consent/cookies', {
      method: 'POST',
      body: JSON.stringify(consent)
    });
    
    if (consent.analytics) {
      enableGoogleAnalytics();
    }
  };
  
  return (
    <div className="cookie-banner">
      <p>Bu site çerezleri kullanmaktadır</p>
      <button onClick={handleAccept}>Kabul Et</button>
    </div>
  );
}
```

### 13.7 Audit Logging

```typescript
// Tüm kişisel veri işlemlerini logla
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  ipAddress: string;
  userAgent: string;
}

// Middleware
async function auditMiddleware(req, res, next) {
  await prisma.auditLog.create({
    data: {
      timestamp: new Date(),
      userId: req.user.id,
      action: req.method,
      resource: req.path,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });
  
  next();
}
```

---

## Performans & Skalabilite

### 9.1 Cache Stratejisi (Redis)

#### Kullanım Alanları

- **Session storage:** JWT refresh token'lar
- **Analysis results:** Kullanıcı Big Five skorları (TTL: 1 saat)
- **Question cache:** Soru listesi (TTL: 24 saat)
- **Rate limiting:** IP bazlı request sayaçları

#### Redis Yapısı

```typescript
// Kullanıcı analiz cache
KEY: `analysis:${userId}`
VALUE: JSON.stringify({
  personality: {...},
  mbti: "INFJ",
  lastUpdated: timestamp
})
TTL: 3600 // 1 saat

// Rate limiting
KEY: `ratelimit:auth:${ip}`
VALUE: requestCount
TTL: 60 // 1 dakika

// Question cache
KEY: `questions:${category}`
VALUE: JSON.stringify([...questions])
TTL: 86400 // 24 saat
```

#### Cache Invalidation

```typescript
// Yeni cevap geldiğinde analiz cache'ini sil
await redis.del(`analysis:${userId}`);

// Admin soru güncellemesinde soru cache'ini sil
await redis.del(`questions:${category}`);
```

### 9.2 Database Connection Pooling

```typescript
// Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20
  poolTimeout = 30
}
```

**Önerilen Pool Ayarları:**

- **Development:** 5-10 connection
- **Staging:** 15-20 connection
- **Production:** 50-100 connection (instance başına)

### 9.3 Query Optimization

#### Index Stratejisi

```sql
-- Answer tablosu için composite index
CREATE INDEX idx_answer_user_created ON answers(user_id, created_at DESC);

-- Emotion history için zaman serisi indexi
CREATE INDEX idx_emotion_timeline ON emotion_history(user_id, timestamp DESC);

-- Question category için index
CREATE INDEX idx_question_category ON questions(category, type);
```

#### Eager Loading

```typescript
// ❌ N+1 problemi
const users = await prisma.user.findMany();
for (const user of users) {
  const answers = await prisma.answer.findMany({ where: { userId: user.id } });
}

// ✅ İyi yaklaşım
const users = await prisma.user.findMany({
  include: {
    answers: true,
    personality: true
  }
});
```

### 9.4 Background Job Processing

AI analizleri senkron değil **asenkron** çalışmalı:

```typescript
// Queue yapısı (BullMQ)
import { Queue } from 'bullmq';

const analysisQueue = new Queue('ai-analysis', {
  connection: redisConnection
});

// Cevap geldiğinde queue'ya ekle
await analysisQueue.add('analyze-text', {
  answerId: answer.id,
  userId: user.id,
  text: answer.answerText
});

// Worker işlemi
analysisQueue.process('analyze-text', async (job) => {
  const { answerId, text } = job.data;
  
  // OpenAI çağrısı (3-5 saniye sürebilir)
  const aiResult = await openai.analyze(text);
  
  // DB'ye kaydet
  await prisma.answer.update({
    where: { id: answerId },
    data: { aiAnalysis: aiResult }
  });
});
```

**Avantajları:**

- API response süresi 50ms'ye düşer (AI beklenmiyor)
- OpenAI rate limit'e takılma riski azalır
- Retry mekanizması ile hata toleransı

### 9.5 Load Balancing

#### Docker Swarm / Kubernetes

```yaml
# docker-compose.yml (multiple replicas)
services:
  api:
    image: psycore/api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

#### Nginx Load Balancer

```nginx
upstream psycore_backend {
    least_conn;
    server api1:3001 weight=3;
    server api2:3001 weight=2;
    server api3:3001 weight=1;
}

server {
    listen 80;
    location /api {
        proxy_pass http://psycore_backend;
    }
}
```

### 9.6 CDN & Static Asset Caching

- **Cloudflare CDN:** Frontend static dosyaları
- **Browser caching:** Images, fonts (1 yıl)
- **API response caching:** Public endpoint'ler (5 dakika)

```typescript
// Cache-Control headers
@CacheControl('public, max-age=300') // 5 dakika
@Get('questions/public')
async getPublicQuestions() {
  return this.questionService.getPublicQuestions();
}
```

### 9.7 Monitoring & Alerting

#### Prometheus Metrics

```typescript
import { Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const aiAnalysisCounter = new Counter({
  name: 'ai_analysis_total',
  help: 'Total number of AI analyses',
  labelNames: ['status']
});
```

#### Grafana Dashboard Metrics

- Request latency (p50, p95, p99)
- DB query performance
- Cache hit ratio
- AI analysis queue length
- Error rate

### 9.8 Skalabilite Hedefleri

| Metrik | Hedef | Strateji |
| --- | --- | --- |
| API Response Time | < 200ms | Cache + indexing |
| Concurrent Users | 10,000+ | Horizontal scaling |
| AI Analysis Time | < 5 saniye | Background queue |
| DB Query Time | < 50ms | Index optimization |
| Cache Hit Ratio | > 80% | Redis stratejisi |
| Uptime | 99.9% | Multi-region deployment |

---

## Güvenlik ve Best Practices

- HTTPS zorunlu
- Argon2 password hashing
- JWT refresh token rotation
- Rate limit
- CORS + Helmet
- Prisma ile SQL Injection koruması

---

## Docker & Deployment

### 10.1 docker-compose.yml Servisleri

- api
- web
- db
- redis
- traefik

### 10.2 Production Pipeline

- Build → Deploy → Migrate → Health Check

---

## CI/CD Pipeline

### 11.1 Pipeline Adımları

```text
1. Testler
2. Build
3. Docker Image
4. Registry Push
5. Coolify Deploy
6. Prisma Migrate
7. Health Check
```

### 11.2 GitHub Actions Pipeline

```yaml
name: PsyCore CI/CD
on:
  push:
    branches: ["main"]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: 18 }
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: |
          docker build -t psycore/api:latest .
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push psycore/api:latest
      - run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            https://coolify.example.com/api/v1/deploy/psycore
      - run: npx prisma migrate deploy
      - run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.psycore.com/health)
          if [ "$STATUS" != "200" ]; then exit 1; fi
```

---

## Roadmap

### 🎯 Versiyon Planlaması ve Zaman Çizelgesi

```text
Timeline:
├── V1 MVP ────────────────────────► (3 ay)
├── V2 Gelişmiş ───────────────────► (2 ay)
├── V3 Sosyal ─────────────────────► (3 ay)
└── V4 Kurumsal ───────────────────► (2 ay)

Toplam: ~10 ay (Production-ready platform)
```

---

### 12.1 V1 – MVP (Minimum Viable Product)

**Süre:** 3 ay (12 hafta)  
**Hedef Kullanıcı:** 100-500 early adopter

#### Sprint 1-2: Temel Altyapı (2 hafta)

**Backend:**

- ✅ NestJS proje kurulumu
- ✅ PostgreSQL + Prisma ORM entegrasyonu
- ✅ JWT authentication (login, register, refresh token)
- ✅ User model + migrations
- ✅ Basic error handling & logging

**Frontend:**

- ✅ Next.js 15 + TypeScript kurulumu
- ✅ Tailwind CSS + shadcn/ui component library
- ✅ NextAuth entegrasyonu
- ✅ Login/Register sayfaları
- ✅ Protected routes

**DevOps:**

- ✅ Docker Compose (local development)
- ✅ GitHub repository setup
- ✅ .env.example dosyaları

#### Sprint 3-4: Soru-Cevap Sistemi (2 hafta)

**Backend:**

- ✅ Question model (type: RANGE, CHOICE, YESNO, TEXT)
- ✅ Answer model + ilişkiler
- ✅ Question CRUD API endpoints
- ✅ Answer submission endpoint
- ✅ Seed data: 50 örnek soru

**Frontend:**

- ✅ Soru listesi sayfası
- ✅ QuestionCard component (4 farklı tip)
- ✅ AnswerInput component
- ✅ Progress bar
- ✅ Form validation

#### Sprint 5-6: Big Five Analiz Motoru (2 hafta)

**Backend:**

- ✅ Big Five trait hesaplama algoritması
- ✅ Weighted scoring sistemi
- ✅ PersonalityProfile model
- ✅ Analysis API endpoint (/analysis/personality)
- ✅ Unit tests (hesaplama doğruluğu)

**Frontend:**

- ✅ Radar chart (Big Five visualization)
- ✅ Trait açıklamaları
- ✅ Skor kartları

#### Sprint 7-8: AI Duygu Analizi (2 hafta)

**Backend:**

- ✅ OpenAI GPT-4 entegrasyonu
- ✅ Emotion analysis prompt engineering
- ✅ EmotionHistory model
- ✅ Background job processing (BullMQ)
- ✅ AI response caching (Redis)

**Frontend:**

- ✅ Duygu etiketleri (JOY, SADNESS, etc.)
- ✅ Sentiment score indicator
- ✅ EmotionCard component

#### Sprint 9-10: Dashboard (2 hafta)

**Frontend:**

- ✅ Dashboard layout
- ✅ Personality overview
- ✅ Recent emotions
- ✅ Stats cards (total answers, completion rate)
- ✅ Export PDF/JSON

**Backend:**

- ✅ Dashboard summary endpoint
- ✅ User statistics calculation
- ✅ Data export API

#### Sprint 11-12: Testing & Deployment (2 hafta)

**Testing:**

- ✅ E2E tests (Cypress)
- ✅ API integration tests
- ✅ Load testing (100 concurrent users)

**Deployment:**

- ✅ Production Docker setup
- ✅ Coolify deployment
- ✅ SSL certificate (Cloudflare)
- ✅ Basic monitoring (Prometheus)
- ✅ Error tracking (Sentry)

**Deliverables:**

- ✅ Working web app (auth + questions + analysis)
- ✅ 50 çeşitli soru
- ✅ Big Five + Emotion analysis
- ✅ Basic dashboard

---

### 12.2 V2 – Gelişmiş Özellikler

**Süre:** 2 ay (8 hafta)  
**Hedef Kullanıcı:** 1,000-5,000 kullanıcı

#### Sprint 13-14: MBTI Modeli (2 hafta)

**Backend:**

- ✅ MBTI hesaplama algoritması
- ✅ Big Five → MBTI mapping
- ✅ Dimension scoring (E/I, S/N, T/F, J/P)
- ✅ GPT-4 MBTI tahmini
- ✅ MBTI descriptions database

**Frontend:**

- ✅ MBTI result page
- ✅ 4 dimension sliders
- ✅ MBTI tipi açıklamaları (16 tip)
- ✅ Uyumlu tipler önerisi

#### Sprint 15-16: Duygu Timeline (2 hafta)

**Backend:**

- ✅ Time-series emotion data aggregation
- ✅ Daily/Weekly/Monthly emotion average
- ✅ Trend analysis API
- ✅ Emotion pattern detection

**Frontend:**

- ✅ Line chart (emotion over time)
- ✅ Date range picker
- ✅ Emotion heatmap (calendar view)
- ✅ Peak/Low emotion highlights

#### Sprint 17-18: Gelişmiş Grafikler (2 hafta)

**Frontend:**

- ✅ Interactive charts (zoom, filter)
- ✅ Comparison view (time periods)
- ✅ Trait evolution timeline
- ✅ Mobile responsive charts
- ✅ Chart export (PNG, SVG)

**Backend:**

- ✅ Aggregated statistics API
- ✅ Comparison data endpoints

#### Sprint 19-20: Performance & UX İyileştirmeleri (2 hafta)

**Backend:**

- ✅ Redis caching strategy
- ✅ Query optimization (indexes)
- ✅ API response time < 200ms
- ✅ Background job retry logic

**Frontend:**

- ✅ Loading states & skeletons
- ✅ Optimistic UI updates
- ✅ Error boundaries
- ✅ Toast notifications
- ✅ Accessibility (WCAG 2.1)

**Deliverables:**

- ✅ MBTI trait analysis
- ✅ Emotion timeline (30 days history)
- ✅ Interactive charts
- ✅ Performans optimizasyonları

---

### 12.3 V3 – Sosyal Sistem

**Süre:** 3 ay (12 hafta)  
**Hedef Kullanıcı:** 10,000+ kullanıcı

#### Sprint 21-23: Kullanıcı Eşleştirme (3 hafta)

**Backend:**

- ✅ Personality matching algorithm
- ✅ Compatibility score calculation
- ✅ Match suggestions API
- ✅ User privacy settings
- ✅ Blocking/reporting system

**Frontend:**

- ✅ Discover page (potential matches)
- ✅ Compatibility percentage
- ✅ Match request system
- ✅ Privacy controls

#### Sprint 24-26: Sosyal Feed (3 hafta)

**Backend:**

- ✅ Post model (text, emotion tag)
- ✅ Like, comment, share
- ✅ Feed algorithm (personalized)
- ✅ Notification system

**Frontend:**

- ✅ Feed page
- ✅ Create post modal
- ✅ Like/comment UI
- ✅ Notification bell

#### Sprint 27-29: Alışkanlık Analizi (3 hafta)

**Backend:**

- ✅ Habit tracking model
- ✅ Daily mood check-in
- ✅ Streak calculation
- ✅ Habit-emotion correlation

**Frontend:**

- ✅ Habit tracker page
- ✅ Daily check-in modal
- ✅ Streak badges
- ✅ Habit insights

#### Sprint 30-32: Gamification (3 hafta)

**Backend:**

- ✅ Achievement system
- ✅ Points & levels
- ✅ Leaderboard
- ✅ Badges & rewards

**Frontend:**

- ✅ Profile badges
- ✅ Leaderboard page
- ✅ Achievement popups
- ✅ Level progress bar

**Deliverables:**

- ✅ Personality-based matching
- ✅ Social feed
- ✅ Habit tracking
- ✅ Gamification features

---

### 12.4 V4 – Kurumsal

**Süre:** 2 ay (8 hafta)  
**Hedef Kullanıcı:** B2B müşteriler (HR, eğitim kurumları)

#### Sprint 33-34: API Marketplace (2 hafta)

**Backend:**

- ✅ Public API key management
- ✅ Rate limiting per API key
- ✅ Usage analytics
- ✅ Billing integration (Stripe)
- ✅ API documentation (Swagger)

**Frontend:**

- ✅ Developer portal
- ✅ API key generation page
- ✅ Usage dashboard
- ✅ Pricing plans

#### Sprint 35-36: Enterprise Dashboard (2 hafta)

**Backend:**

- ✅ Organization model (multi-tenant)
- ✅ Team management
- ✅ Bulk user import
- ✅ Advanced analytics API

**Frontend:**

- ✅ Admin panel
- ✅ Team overview
- ✅ Bulk operations
- ✅ Custom reports

#### Sprint 37-38: White-label & Customization (2 hafta)

**Backend:**

- ✅ Tenant-specific branding
- ✅ Custom domain support
- ✅ Theme customization API

**Frontend:**

- ✅ Branding settings page
- ✅ Custom logo/colors
- ✅ Theme preview

#### Sprint 39-40: Enterprise Features (2 hafta)

**Backend:**

- ✅ SSO integration (SAML, OAuth)
- ✅ Advanced RBAC (Role-Based Access Control)
- ✅ Audit logs
- ✅ GDPR compliance tools

**Frontend:**

- ✅ SSO login flow
- ✅ Role management
- ✅ Audit log viewer
- ✅ Data export tools

**Deliverables:**

- ✅ API Marketplace
- ✅ Enterprise admin panel
- ✅ White-label options
- ✅ SSO + advanced security

---

### 📊 Özet Tablo

| Versiyon | Süre | Sprint Sayısı | Ana Özellikler |
| --- | --- | --- | --- |
| **V1 MVP** | 3 ay | 12 sprint | Auth, Sorular, Big Five, AI Duygu Analizi, Dashboard |
| **V2 Gelişmiş** | 2 ay | 8 sprint | MBTI, Emotion Timeline, Grafikler, Performance |
| **V3 Sosyal** | 3 ay | 12 sprint | Matching, Feed, Habits, Gamification |
| **V4 Kurumsal** | 2 ay | 8 sprint | API Marketplace, Enterprise Panel, White-label |
| **TOPLAM** | **10 ay** | **40 sprint** | Full-featured platform |

### 🚀 Milestone Hedefleri

```text
Month 1-3 (V1):   → 100-500 kullanıcı
Month 4-5 (V2):   → 1,000-5,000 kullanıcı
Month 6-8 (V3):   → 10,000+ kullanıcı
Month 9-10 (V4):  → B2B müşteriler + API partners
```

---

## Prisma Model şemasi

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  username      String
  createdAt     DateTime @default(now())

  answers       Answer[]
  personality   PersonalityProfile?
  emotionHistory EmotionHistory[]
}

model Question {
  id        String   @id @default(uuid())
  text      String
  type      QuestionType
  category  QuestionCategory
  weight    Int
  options   Json?
  createdAt DateTime @default(now())

  answers   Answer[]
}

enum QuestionType {
  TEXT
  RANGE
  CHOICE
  YESNO
}

enum QuestionCategory {
  PERSONALITY
  EMOTION
  DECISION
  VALUES
}

model Answer {
  id           String   @id @default(uuid())
  userId       String
  questionId   String
  answerText   String?
  numericScore Float?
  emotion      EmotionType?
  createdAt    DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([questionId])
  @@index([userId, questionId])
}

enum EmotionType {
  JOY
  SADNESS
  ANGER
  FEAR
  SURPRISE
  CALM
}

model PersonalityProfile {
  id       String   @id @default(uuid())
  userId   String   @unique
  openness      Float
  conscientious Float
  extraversion  Float
  agreeableness Float
  neuroticism   Float
  updatedAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model EmotionHistory {
  id        String   @id @default(uuid())
  userId    String
  emotion   EmotionType
  score     Float
  timestamp DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp])
}
```

---

## API Response Examples

### 14.1 Auth Login

```json
{
  "access_token": "token123",
  "refresh_token": "token456",
  "user": {
    "id": "u1",
    "email": "user@example.com",
    "username": "testuser"
  }
}
```

### 14.2 Question List

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Karar verirken mantık mı duygu mu?",
      "type": "TEXT",
      "category": "PERSONALITY",
      "weight": 4
    }
  ]
}
```

### 14.3 Analysis Summary

```json
{
  "personality": {
    "openness": 0.71,
    "extraversion": 0.42
  },
  "emotionTimeline": [
    {
      "date": "2025-01-01",
      "emotion": "JOY",
      "score": 0.82
    }
  ]
}
```

---

## Logging & Monitoring

### 15.1 Logging

- Backend: Pino logger
- Log seviyesi: info, warn, error
- Error log: Logtail veya Loki

### 15.2 Monitoring

- Prometheus metrics endpoint: `/metrics`
- Grafana dashboard
- Uptime check: `/health`

---

## Security Enhancements

- Cloudflare WAF aktif
- Rate limiting (auth için 5 req/min)
- Helmet güvenlik başlıkları:
  - X-Frame-Options
  - HSTS
  - Content-Security-Policy
- Brute-force block (5 hatalı login → 15 dk ban)

---

## Proje Klasör Yapisi

### 17.1 Frontend

```text
frontend/
  app/
  components/
  lib/
  hooks/
  styles/
```

### 17.2 Backend

```text
backend/
  src/
    modules/
    common/
    prisma/
    middleware/
  tests/
```

---

## Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/psycore
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
CLOUDFLARE_API_TOKEN=your-token
```

---

## ✅ Dokümantasyon Tamamlandı

Bu dokümantasyon sürekli güncellenmektedir. Sorularınız için GitHub Issues kullanabilirsiniz.
