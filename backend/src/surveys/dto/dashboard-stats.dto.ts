export class DashboardStatsDto {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  totalTextResponses: number;
  analyzedResponses: number;
  
  recentActivity: {
    surveyId: string;
    surveyTitle: string;
    responseCount: number;
    lastResponseAt: Date;
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
