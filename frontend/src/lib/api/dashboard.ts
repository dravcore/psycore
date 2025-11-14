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

export const dashboardApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get('/surveys/dashboard/stats');
    return response.data;
  },
};
