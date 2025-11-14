import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { SurveyStatisticsDto, QuestionStatistics } from './dto/survey-statistics.dto';
import { AIInsightsDto, SentimentAnalysisDto } from './dto/ai-insights.dto';

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  async create(userId: string, createSurveyDto: CreateSurveyDto) {
    console.log('Creating survey with userId:', userId);
    console.log('Survey data:', createSurveyDto);
    
    const { questions, ...surveyData } = createSurveyDto;

    const surveyCreateData = {
      ...surveyData,
      creatorId: userId,
      questions: {
        create: questions,
      },
    };
    
    console.log('Survey create data:', JSON.stringify(surveyCreateData, null, 2));

    return this.prisma.survey.create({
      data: surveyCreateData,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(userId?: string) {
    return this.prisma.survey.findMany({
      where: userId ? { creatorId: userId } : { isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            responses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Anket bulunamadı');
    }

    return survey;
  }

  async update(id: string, userId: string, updateSurveyDto: UpdateSurveyDto) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
    });

    if (!survey) {
      throw new NotFoundException('Anket bulunamadı');
    }

    if (survey.creatorId !== userId) {
      throw new ForbiddenException('Bu anketi güncelleme yetkiniz yok');
    }

    return this.prisma.survey.update({
      where: { id },
      data: updateSurveyDto,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
    });

    if (!survey) {
      throw new NotFoundException('Anket bulunamadı');
    }

    if (survey.creatorId !== userId) {
      throw new ForbiddenException('Bu anketi silme yetkiniz yok');
    }

    return this.prisma.survey.delete({
      where: { id },
    });
  }

  async submitResponse(surveyId: string, userId: string, submitResponseDto: SubmitResponseDto) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: true },
    });

    if (!survey) {
      throw new NotFoundException('Anket bulunamadı');
    }

    if (!survey.isActive) {
      throw new ForbiddenException('Bu anket artık aktif değil');
    }

    // Check if user already responded
    const existingResponse = await this.prisma.surveyResponse.findUnique({
      where: {
        surveyId_userId: {
          surveyId,
          userId,
        },
      },
    });

    if (existingResponse) {
      throw new ForbiddenException('Bu anketi zaten doldurdunuz');
    }

    // Create response with answers
    const response = await this.prisma.surveyResponse.create({
      data: {
        surveyId,
        userId,
        answers: {
          create: submitResponseDto.answers,
        },
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    return response;
  }

  private async performSentimentAnalysis(answers: any[]) {
    const textAnswers = answers.filter(a => a.question?.type === 'TEXT' && a.value.trim().length > 0);
    
    if (textAnswers.length === 0) {
      return;
    }

    this.logger.log(`Performing sentiment analysis on ${textAnswers.length} TEXT answers`);

    for (let i = 0; i < textAnswers.length; i++) {
      const answer = textAnswers[i];
      try {
        const analysis = await this.geminiService.analyzeSentiment(answer.value);
        
        await this.prisma.sentimentAnalysis.create({
          data: {
            answerId: answer.id,
            sentiment: analysis.sentiment,
            confidence: analysis.confidence,
            emotions: analysis.emotions,
            keywords: analysis.keywords,
            summary: analysis.summary,
          },
        });

        this.logger.log(`Sentiment analysis completed for answer ${answer.id}: ${analysis.sentiment} (${analysis.confidence})`);
        
        // Rate limit protection: wait 4 seconds between requests (15 RPM = 1 request per 4 seconds)
        if (i < textAnswers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 4000));
        }
      } catch (error) {
        this.logger.error(`Failed to analyze sentiment for answer ${answer.id}:`, error);
        
        // If rate limited, wait longer before next attempt
        if (error.status === 429 && i < textAnswers.length - 1) {
          this.logger.warn('Rate limit hit, waiting 60 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    }
  }

  async getResponses(surveyId: string, userId: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Anket bulunamadı');
    }

    if (survey.creatorId !== userId) {
      throw new ForbiddenException('Bu anketin sonuçlarını görme yetkiniz yok');
    }

    return this.prisma.surveyResponse.findMany({
      where: { surveyId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  async getStatistics(surveyId: string, userId: string): Promise<SurveyStatisticsDto> {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        responses: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Anket bulunamadı');
    }

    if (survey.creatorId !== userId) {
      throw new ForbiddenException('Bu anketin istatistiklerini görme yetkiniz yok');
    }

    const totalResponses = survey.responses.length;
    const lastResponse = survey.responses.length > 0 
      ? survey.responses[survey.responses.length - 1].completedAt 
      : undefined;

    // Calculate question statistics
    const questionStats: QuestionStatistics[] = survey.questions.map(question => {
      const answers = survey.responses
        .flatMap(r => r.answers)
        .filter(a => a.questionId === question.id);

      const stat: QuestionStatistics = {
        questionId: question.id,
        questionText: question.text,
        type: question.type,
        totalResponses: answers.length,
      };

      // Calculate based on question type
      if (question.type === 'RANGE' || question.type === 'CHOICE') {
        const numericValues = answers
          .map(a => parseFloat(a.value))
          .filter(v => !isNaN(v));

        if (numericValues.length > 0) {
          stat.averageValue = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
          
          // Distribution
          const distribution: { [key: string]: number } = {};
          answers.forEach(a => {
            distribution[a.value] = (distribution[a.value] || 0) + 1;
          });
          stat.distribution = distribution;
        }
      } else if (question.type === 'YESNO') {
        // Yes/No distribution
        const distribution: { [key: string]: number } = {};
        answers.forEach(a => {
          const normalized = a.value.toLowerCase().trim();
          distribution[normalized] = (distribution[normalized] || 0) + 1;
        });
        stat.distribution = distribution;
      } else if (question.type === 'TEXT') {
        // Most common text answers
        const textCounts: { [key: string]: number } = {};
        answers.forEach(a => {
          const normalized = a.value.toLowerCase().trim();
          textCounts[normalized] = (textCounts[normalized] || 0) + 1;
        });

        stat.commonAnswers = Object.entries(textCounts)
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 most common answers
      }

      return stat;
    });

    // Check if any TEXT answers have AI analysis
    const textAnswersCount = survey.responses
      .flatMap((r: any) => r.answers)
      .filter((a: any) => {
        const question = survey.questions.find((q: any) => q.id === a.questionId);
        return question?.type === 'TEXT';
      }).length;

    const analyzedAnswersCount = await this.prisma.sentimentAnalysis.count({
      where: {
        answer: {
          response: {
            surveyId: surveyId,
          },
        },
      },
    });

    const hasAIAnalysis = textAnswersCount > 0 && analyzedAnswersCount > 0;

    return {
      surveyId: survey.id,
      title: survey.title,
      totalResponses,
      completionRate: 100, // TODO: Calculate based on started vs completed
      questions: questionStats,
      createdAt: survey.createdAt,
      lastResponseAt: lastResponse,
      hasAIAnalysis,
    };
  }

  async getAIInsights(surveyId: string, userId: string): Promise<AIInsightsDto> {
    const survey: any = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: true,
        responses: {
          include: {
            answers: {
              include: {
                question: true,
                analysis: true,
              },
            },
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Anket bulunamadı');
    }

    if (survey.creatorId !== userId) {
      throw new ForbiddenException('Bu anketin AI analizlerini görme yetkiniz yok');
    }

    // Get all TEXT answers
    const allTextAnswers = survey.responses
      .flatMap((r: any) => r.answers)
      .filter((a: any) => a.question?.type === 'TEXT');

    const totalTextResponses = allTextAnswers.length;

    // Find answers that don't have analysis yet
    const answersWithoutAnalysis = allTextAnswers.filter((a: any) => !a.analysis);
    
    // Perform sentiment analysis for answers without analysis
    if (answersWithoutAnalysis.length > 0) {
      this.logger.log(`Performing AI analysis on ${answersWithoutAnalysis.length} unanswered TEXT responses`);
      await this.performSentimentAnalysis(answersWithoutAnalysis);
      
      // Refetch the survey with updated analyses
      const updatedSurvey: any = await this.prisma.survey.findUnique({
        where: { id: surveyId },
        include: {
          questions: true,
          responses: {
            include: {
              answers: {
                include: {
                  question: true,
                  analysis: true,
                },
              },
            },
          },
        },
      });
      
      if (updatedSurvey) {
        survey.responses = updatedSurvey.responses;
      }
    }

    // Get all TEXT answers with their analyses
    const textAnswers = survey.responses
      .flatMap((r: any) => r.answers)
      .filter((a: any) => a.question?.type === 'TEXT' && a.analysis);

    if (textAnswers.length === 0) {
      return {
        surveyId: survey.id,
        title: survey.title,
        totalTextResponses,
        analyzedResponses: 0,
        overallSentiment: {
          positive: 0,
          negative: 0,
          neutral: 0,
          mixed: 0,
        },
        averageConfidence: 0,
        commonEmotions: [],
        topKeywords: [],
        analyses: [],
      };
    }

    // Calculate overall sentiment distribution
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
      mixed: 0,
    };

    let totalConfidence = 0;
    const emotionCounts: { [key: string]: number } = {};
    const keywordCounts: { [key: string]: number } = {};

    const analyses: SentimentAnalysisDto[] = textAnswers
      .filter((answer: any) => answer.analysis) // Ensure analysis exists
      .map((answer: any) => {
        const analysis = answer.analysis;
        
        // Count sentiments
        sentimentCounts[analysis.sentiment as keyof typeof sentimentCounts]++;
        
        // Sum confidence
        totalConfidence += analysis.confidence;

        // Count emotions
        if (Array.isArray(analysis.emotions)) {
          analysis.emotions.forEach((e: any) => {
            emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
          });
        }

        // Count keywords
        analysis.keywords.forEach(keyword => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });

        return {
          answerId: answer.id,
          questionText: answer.question.text,
          answerValue: answer.value,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          emotions: Array.isArray(analysis.emotions) ? (analysis.emotions as any[]).map((e: any) => ({
            emotion: e.emotion,
            intensity: e.intensity,
          })) : [],
          keywords: analysis.keywords,
          summary: analysis.summary,
          createdAt: analysis.createdAt,
        };
      });

    // Get top emotions and keywords
    const commonEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Generate AI summary
    let aiSummary: string | undefined;
    try {
      aiSummary = await this.geminiService.generateInsight({
        totalResponses: textAnswers.length,
        sentiments: sentimentCounts,
        topEmotions: commonEmotions.slice(0, 5).map(e => e.emotion),
        topKeywords: topKeywords.slice(0, 10).map(k => k.keyword),
      });
    } catch (error) {
      this.logger.error('Failed to generate AI summary:', error);
    }

    return {
      surveyId: survey.id,
      title: survey.title,
      totalTextResponses,
      analyzedResponses: textAnswers.length,
      overallSentiment: sentimentCounts,
      averageConfidence: totalConfidence / textAnswers.length,
      commonEmotions,
      topKeywords,
      analyses,
      aiSummary,
    };
  }
}
