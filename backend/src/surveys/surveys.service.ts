import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { SurveyStatisticsDto, QuestionStatistics } from './dto/survey-statistics.dto';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.surveyResponse.create({
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

    return {
      surveyId: survey.id,
      title: survey.title,
      totalResponses,
      completionRate: 100, // TODO: Calculate based on started vs completed
      questions: questionStats,
      createdAt: survey.createdAt,
      lastResponseAt: lastResponse,
    };
  }
}
