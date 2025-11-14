import axios from '@/lib/axios';

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  type: string;
  totalResponses: number;
  averageValue?: number;
  distribution?: { [key: string]: number };
  commonAnswers?: Array<{ value: string; count: number }>;
}

export interface SurveyStatistics {
  surveyId: string;
  title: string;
  totalResponses: number;
  completionRate: number;
  averageCompletionTime?: number;
  questions: QuestionStatistics[];
  createdAt: string;
  lastResponseAt?: string;
  hasAIAnalysis?: boolean;
}

export const statisticsApi = {
  async getSurveyStatistics(surveyId: string): Promise<SurveyStatistics> {
    const response = await axios.get(`/surveys/${surveyId}/statistics`);
    return response.data;
  },
};
