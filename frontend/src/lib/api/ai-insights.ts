import axiosInstance from '../axios';

export interface EmotionData {
  emotion: string;
  intensity: number;
}

export interface SentimentAnalysis {
  answerId: string;
  questionText: string;
  answerValue: string;
  sentiment: string;
  confidence: number;
  emotions: EmotionData[];
  keywords: string[];
  summary: string;
  createdAt: string;
}

export interface AIInsights {
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
  commonEmotions: Array<{ emotion: string; count: number }>;
  topKeywords: Array<{ keyword: string; count: number }>;
  analyses: SentimentAnalysis[];
  aiSummary?: string;
}

export const aiInsightsApi = {
  getAIInsights: async (surveyId: string): Promise<AIInsights> => {
    const response = await axiosInstance.get(`/surveys/${surveyId}/ai-insights`);
    return response.data;
  },
};
