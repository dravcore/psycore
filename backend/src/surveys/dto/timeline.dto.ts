export class TimelineEntryDto {
  date: Date;
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

export class TimelineDto {
  entries: TimelineEntryDto[];
  
  // Aggregated data for visualization
  sentimentTrend: {
    date: string; // YYYY-MM-DD format
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
      start: Date;
      end: Date;
    };
    dominantSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    mostFrequentEmotions: {
      emotion: string;
      count: number;
    }[];
  };
}
