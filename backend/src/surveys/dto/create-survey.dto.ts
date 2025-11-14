import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  RANGE = 'RANGE',
  CHOICE = 'CHOICE',
  YESNO = 'YESNO',
  TEXT = 'TEXT',
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsInt()
  @Min(0)
  order: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsInt()
  @IsOptional()
  @Min(1)
  minValue?: number;

  @IsInt()
  @IsOptional()
  @Max(10)
  maxValue?: number;
}

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
