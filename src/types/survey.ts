export type QuestionType = 'text' | 'textarea' | 'single' | 'multiple' | 'dropdown' | 'rating'

export interface Question {
  id: string
  type: QuestionType
  title: string
  required: boolean
  options?: string[] // for single / multiple / dropdown
  maxRating?: number // for rating, default 5
}

export interface Survey {
  id: string
  title: string
  description: string
  createdAt: number
  updatedAt: number
  questions: Question[]
  /** whether this survey accepts responses */
  open: boolean
}

export interface Answer {
  questionId: string
  /** text / dropdown: string; single: option; multiple: string[]; rating: number */
  value: string | string[] | number | null
}

export interface Response {
  id: string
  surveyId: string
  submittedAt: number
  answers: Answer[]
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: '单行文本',
  textarea: '多行文本',
  single: '单选题',
  multiple: '多选题',
  dropdown: '下拉选择',
  rating: '评分题',
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
