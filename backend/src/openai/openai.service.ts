import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

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
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. AI features will be disabled.');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const prompt = `Analyze the following text for sentiment and emotions. Provide a detailed psychological analysis.

Text: "${text}"

Respond in JSON format with the following structure:
{
  "sentiment": "positive|negative|neutral|mixed",
  "confidence": 0.0-1.0,
  "emotions": [
    {"emotion": "joy|sadness|anger|fear|surprise|disgust|anxiety|hope|etc", "intensity": 0.0-1.0}
  ],
  "keywords": ["key", "words", "from", "text"],
  "summary": "Brief psychological interpretation"
}

Focus on:
- Overall sentiment (positive, negative, neutral, or mixed)
- Specific emotions detected with intensity levels
- Key psychological indicators
- Brief professional summary`;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional psychologist specialized in sentiment analysis and emotional intelligence. Provide accurate, evidence-based assessments.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const result = JSON.parse(content);
      
      this.logger.log(`Sentiment analyzed for text (length: ${text.length})`);
      
      return result;
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
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    try {
      const prompt = `Based on the following psychological assessment data, provide a professional insight:

${JSON.stringify(analysisData, null, 2)}

Provide a brief, professional psychological insight (2-3 sentences) that would be helpful for the user to understand their emotional state or personality traits.`;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate psychologist providing helpful insights to users about their emotional and mental states.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return content;
    } catch (error) {
      this.logger.error('Error generating insight:', error);
      throw error;
    }
  }
}
