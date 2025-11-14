export class QuestionStatistics {
  questionId: string;
  questionText: string;
  type: string;
  totalResponses: number;
  averageValue?: number;
  distribution?: { [key: string]: number };
  commonAnswers?: Array<{ value: string; count: number }>;
}

export class SurveyStatisticsDto {
  surveyId: string;
  title: string;
  totalResponses: number;
  completionRate: number;
  averageCompletionTime?: number;
  questions: QuestionStatistics[];
  createdAt: Date;
  lastResponseAt?: Date;
  hasAIAnalysis?: boolean;
}
