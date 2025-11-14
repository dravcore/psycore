import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  emotions: Array<{
    emotion: string;
    intensity: number;
  }>;
  keywords: string[];
  summary: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.logger.log('Google Gemini 1.5 Flash AI initialized successfully');
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    if (!this.model) {
      throw new Error('Google AI not configured');
    }

    try {
      const prompt = `Sen profesyonel bir psikolog ve duygu analizi uzmanısın. Aşağıdaki metni analiz et ve psikolojik bir değerlendirme yap.

Metin: "${text}"

Lütfen sadece aşağıdaki JSON formatında yanıt ver (başka açıklama ekleme):
{
  "sentiment": "positive veya negative veya neutral veya mixed",
  "confidence": 0.0 ile 1.0 arası güven skoru,
  "emotions": [
    {"emotion": "mutluluk|üzüntü|öfke|korku|şaşkınlık|tiksinme|endişe|umut|vb", "intensity": 0.0-1.0}
  ],
  "keywords": ["metindeki", "anahtar", "kelimeler"],
  "summary": "Kısa psikolojik yorum"
}

Odaklan:
- Genel duygu durumu (pozitif, negatif, nötr veya karışık)
- Tespit edilen spesifik duygular ve yoğunlukları
- Psikolojik göstergeler
- Kısa profesyonel özet (Türkçe)`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      // Extract JSON from markdown code blocks if present
      let jsonText = content.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsedResult = JSON.parse(jsonText);
      
      this.logger.log(`Sentiment analyzed for text (length: ${text.length})`);
      
      return parsedResult;
    } catch (error) {
      this.logger.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async batchAnalyzeSentiments(texts: string[]): Promise<SentimentAnalysisResult[]> {
    const results: SentimentAnalysisResult[] = [];
    
    for (const text of texts) {
      try {
        const result = await this.analyzeSentiment(text);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to analyze text: ${text.substring(0, 50)}...`, error);
        // Return neutral result on error
        results.push({
          sentiment: 'neutral',
          confidence: 0,
          emotions: [],
          keywords: [],
          summary: 'Analysis failed',
        });
      }
    }

    return results;
  }

  async generateInsight(analysisData: any): Promise<string> {
    if (!this.model) {
      throw new Error('Google AI not configured');
    }

    try {
      const prompt = `Sen empatik bir psikologsun ve kullanıcılara duygusal durumları hakkında yardımcı içgörüler sağlıyorsun.

Aşağıdaki psikolojik değerlendirme verilerine dayanarak profesyonel bir içgörü sun:

${JSON.stringify(analysisData, null, 2)}

Kullanıcının duygusal durumunu veya kişilik özelliklerini anlamasına yardımcı olacak kısa, profesyonel bir içgörü sun (2-3 cümle, Türkçe).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      return content.trim();
    } catch (error) {
      this.logger.error('Error generating insight:', error);
      throw error;
    }
  }
}
