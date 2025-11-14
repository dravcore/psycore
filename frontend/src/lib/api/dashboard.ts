import axios from '@/lib/axios';

export interface DashboardStats {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  totalTextResponses: number;
  analyzedResponses: number;
  
  recentActivity: {
    surveyId: string;
    surveyTitle: string;
    responseCount: number;
    lastResponseAt: string;
  }[];
  
  sentimentOverview?: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  
  topEmotions?: {
    emotion: string;
    count: number;
  }[];
  
  surveysWithMostResponses: {
    surveyId: string;
    title: string;
    responseCount: number;
    hasAIAnalysis: boolean;
  }[];
}

export interface TimelineEntry {
  date: string;
  surveyId: string;
  surveyTitle: string;
  questionText: string;
  answerValue: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  emotions: {
    emotion: string;
    intensity: number;
  }[];
  summary: string;
}

export interface Timeline {
  entries: TimelineEntry[];
  
  sentimentTrend: {
    date: string;
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  }[];
  
  emotionTrend: {
    date: string;
    emotions: {
      emotion: string;
      avgIntensity: number;
    }[];
  }[];
  
  overallStats: {
    totalEntries: number;
    dateRange: {
      start: string;
      end: string;
    };
    dominantSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    mostFrequentEmotions: {
      emotion: string;
      count: number;
    }[];
  };
}

export const dashboardApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get('/surveys/dashboard/stats');
    return response.data;
  },

  async getTimeline(startDate?: string, endDate?: string): Promise<Timeline> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`/surveys/dashboard/timeline?${params.toString()}`);
    return response.data;
  },
};
