export interface Survey {
  id: string;
  name: string;
  created_at: Date;
  expires_at: Date;
  last_updated: Date;
  status: SurveyStatus;
  questions: Question[];
  prevent_duplicates?: boolean;
  submission_count: number;
  is_locked: boolean;
}


export interface SurveyCreate {
  name: string;
  expires_delta?: number;
  prevent_duplicates?: boolean;
  status?: SurveyStatus;
}


export enum SurveyStatus {
  PUBLIC = 'public',
  PRIVATE = 'private',
  EXPIRED = 'expired'
}


export enum AnswerType {
  OPEN = 'open',
  CLOSE = 'close',
  MULTIPLE = 'multiple',
  SCALE = 'scale',
  RATING = 'rating',
  YES_NO = 'yes_no',
  DROPDOWN = 'dropdown',
  DATE = 'date',
  EMAIL = 'email',
  NUMBER = 'number'
}


export interface Question {
  id: string;
  content: string;
  position: number;
  answer_type: AnswerType;
  choices: Choice[];
  settings?: QuestionSettings;
}


export interface QuestionCreate {
  content: string;
  position: number;
  answer_type: AnswerType;
  choices?: ChoiceCreate[];
  settings?: QuestionSettings;
}


export interface QuestionSettings {
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  placeholder?: string;
}


export interface Choice {
  position: number;
  content: string;
}


export interface ChoiceCreate {
  position: number;
  content: string;
}


export interface Submission {
  id: string;
  survey_id: string;
  created_at?: Date;
  answers: Answer[];
}


export interface SubmissionCreate {
  survey_id: string;
  answers: AnswerCreate[];
}


export interface Answer {
  question_id: string;
  response: string;
}


export interface AnswerCreate {
  question_id: string;
  response: string;
}


export interface ShareLink {
  id: string;
  survey_id: string;
  share_token: string;
  is_active: boolean;
  max_responses?: number;
  password?: string;
  expires_at?: Date;
  created_at: Date;
  clicks: number;
}


export interface ShareLinkCreate {
  is_active?: boolean;
  max_responses?: number;
  password?: string;
  expires_at?: Date;
}


export enum TemplateCategory {
  FEEDBACK = 'feedback',
  QUIZ = 'quiz',
  POLL = 'poll',
  RESEARCH = 'research',
  EVENT = 'event',
  SATISFACTION = 'satisfaction',
  CUSTOM = 'custom'
}


export interface SurveyTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  questions_data: any;
  is_public: boolean;
  created_at: Date;
  usage_count: number;
}


export interface SurveyTemplateCreate {
  name: string;
  description?: string;
  category: TemplateCategory;
  questions_data: any;
  is_public?: boolean;
}
