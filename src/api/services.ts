import { MOCK_QUIZZES, MOCK_CERTIFICATIONS, MOCK_STATS } from './mockData';

const DELAY = 500;

export const authService = {
  login: async (email: string, password: string, isAdmin = false) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    if (email && password) {
      const user = {
        id: isAdmin ? 'admin_1' : 'student_1',
        name: isAdmin ? 'Admin User' : 'Eric T.',
        email,
        role: isAdmin ? 'admin' : 'student'
      };
      return { user, token: 'mock-jwt-token' };
    }
    throw new Error('Invalid credentials');
  },
  register: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return { success: true };
  }
};

export const quizService = {
  getQuizzes: async () => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return MOCK_QUIZZES;
  },
  getQuizById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    const quiz = MOCK_QUIZZES.find(q => q.id === id);
    if (!quiz) throw new Error('Quiz not found');
    return quiz;
  },
  submitQuiz: async (quizId: string, answers: number[]) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');
    
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    
    const percentage = (score / quiz.questions.length) * 100;
    const passed = percentage >= 80;
    
    return { score, total: quiz.questions.length, percentage, passed };
  },
  // Admin only
  createQuiz: async (quiz: any) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return { ...quiz, id: Math.random().toString(36).substr(2, 9) };
  },
  updateQuiz: async (id: string, quiz: any) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return quiz;
  },
  deleteQuiz: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return { success: true };
  }
};

export const adminService = {
  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return MOCK_STATS;
  },
  getCertifiedUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return [
      { id: '1', name: 'John Doe', email: 'john@example.com', cert: 'React Advanced', date: '2024-02-10' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', cert: 'Azure Cloud', date: '2024-03-01' },
      { id: '3', name: 'Bob Wilson', email: 'bob@example.com', cert: 'React Advanced', date: '2024-03-12' }
    ];
  }
};

export const studentService = {
  getCertifications: async () => {
    await new Promise(resolve => setTimeout(resolve, DELAY));
    return MOCK_CERTIFICATIONS;
  }
};
