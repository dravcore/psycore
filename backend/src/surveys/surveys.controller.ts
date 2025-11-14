import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createSurveyDto: CreateSurveyDto) {
    return this.surveysService.create(req.user.userId, createSurveyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any) {
    return this.surveysService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveysService.update(id, req.user.userId, updateSurveyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.surveysService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/responses')
  submitResponse(@Param('id') id: string, @Request() req, @Body() submitResponseDto: SubmitResponseDto) {
    return this.surveysService.submitResponse(id, req.user.userId, submitResponseDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/responses')
  getResponses(@Param('id') id: string, @Request() req) {
    return this.surveysService.getResponses(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/statistics')
  getStatistics(@Param('id') id: string, @Request() req) {
    return this.surveysService.getStatistics(id, req.user.userId);
  }
}
