// Types basés sur les modèles Django backend

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'admin';
  profile_image?: string;
  profile_image_url?: string;
  phone_number?: string;
  country?: string;
  country_code?: string;
  created_at: string;
}

export interface Option {
  id: string;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  order: number;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  trainer_name: string;
  timer_minutes: number;
  min_score_percentage: number;
  max_attempts: number;
  validity_hours: number;
  is_active: boolean;
  expiration_date: string;
  created_at: string;
  questions_count?: number;
  attempts_count?: number;
  questions?: Question[];
}

export interface QuizDetail extends Quiz {
  questions: Question[];
}

export interface Attempt {
  id: string;
  quiz: string;
  quiz_title: string;
  score: number;
  passed: boolean;
  attempt_date: string;
  remaining_attempts: number;
}

export interface Certification {
  id: string;
  quiz: string;
  quiz_title: string;
  obtained_date: string;
  png_file?: string;
  pdf_file?: string;
}

export interface AdminStats {
  total_users: number;
  total_quizzes: number;
  total_attempts: number;
  total_certifications: number;
  success_rate: number;
  users_growth: number;
  quizzes_growth: number;
  attempts_growth: number;
  certifications_growth: number;
}

export interface UserListItem extends User {
  certifications_count: number;
}
