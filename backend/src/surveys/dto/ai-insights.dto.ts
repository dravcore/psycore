export class EmotionDto {
  emotion: string;
  intensity: number;
}

export class SentimentAnalysisDto {
  answerId: string;
  questionText: string;
  answerValue: string;
  sentiment: string;
  confidence: number;
  emotions: EmotionDto[];
  keywords: string[];
  summary: string;
  createdAt: Date;
}

export class AIInsightsDto {
  surveyId: string;
  title: string;
  totalTextResponses: number;
  analyzedResponses: number;
  overallSentiment: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  averageConfidence: number;
  commonEmotions: { emotion: string; count: number }[];
  topKeywords: { keyword: string; count: number }[];
  analyses: SentimentAnalysisDto[];
  aiSummary?: string;
}
