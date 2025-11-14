import axiosInstance from '../axios';

export interface Question {
  id?: string;
  text: string;
  type: 'RANGE' | 'CHOICE' | 'YESNO' | 'TEXT';
  required: boolean;
  order: number;
  minValue?: number;
  maxValue?: number;
  options?: string[];
  multipleChoice?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
  creator?: {
    id: string;
    username: string;
    email: string;
  };
  _count?: {
    questions: number;
    responses: number;
  };
}

export interface CreateSurveyDto {
  title: string;
  description: string;
  questions: Omit<Question, 'id'>[];
}

export interface SubmitResponseDto {
  answers: {
    questionId: string;
    value: string;
  }[];
}

export const surveysApi = {
  create: async (data: CreateSurveyDto): Promise<Survey> => {
    const response = await axiosInstance.post('/surveys', data);
    return response.data;
  },

  getAll: async (): Promise<Survey[]> => {
    const response = await axiosInstance.get('/surveys');
    return response.data;
  },

  getOne: async (id: string): Promise<Survey> => {
    const response = await axiosInstance.get(`/surveys/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateSurveyDto>): Promise<Survey> => {
    const response = await axiosInstance.patch(`/surveys/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/surveys/${id}`);
  },

  submitResponse: async (surveyId: string, data: SubmitResponseDto) => {
    const response = await axiosInstance.post(`/surveys/${surveyId}/responses`, data);
    return response.data;
  },

  getResponses: async (surveyId: string) => {
    const response = await axiosInstance.get(`/surveys/${surveyId}/responses`);
    return response.data;
  },
};
