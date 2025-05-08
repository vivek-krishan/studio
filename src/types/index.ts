export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

export interface Question {
  id: string;
  text: string;
  keywords: string; // Comma-separated keywords for AI evaluation
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
}

export interface AnswerEvaluation {
  questionId: string;
  studentAnswer: string;
  isCorrect?: boolean;
  feedback?: string;
  isLoading: boolean;
}
