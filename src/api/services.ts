import api from './client';

// --- get user token ---


// --- Authentication Service ---
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      console.log(response)
      const email_verified=response?.data?.email_verified;
      const is_active= response.data.is_active
      const redirect_to= response.data.redirect_to
      if (!email_verified && redirect_to) {
        return{email_verified:email_verified,redirect_to:redirect_to};
      }else{
        const { user, access, refresh } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token: access };
      }
      
    } catch (error: any) {
      console.log('error: ',error)
      throw new Error(error.response?.data?.error || 'Identifiants invalides');
    }
  },
  
  register: async (data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    phone_number?: string;
    country?: string;
    country_code?: string;
  }) => {
    try {
      const response = await api.post('/auth/register/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'inscription');
    }
  },

  verifyEmail: async (email: string, code: string) => {
    try {
      const response = await api.post('/auth/verify-email/', { email, code });
      const { user, access, refresh } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Code de vérification incorrect');
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password/', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'email');
    }
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password/', { 
        email, 
        code, 
        new_password: newPassword 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe');
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du profil');
    }
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    country?: string;
    country_code?: string;
  }) => {
    try {
      const response = await api.patch('/auth/me/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    }
  },

  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => {
    try {
      const response = await api.post('/auth/change-password/', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors du changement de mot de passe');
    }
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    
    try {
      const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      return access;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors du rafraîchissement du token');
    }
  }
};

// --- Quiz Service ---
export const quizService = {
  getQuizzes: async () => {
    try {
      const response = await api.get('/quizzes/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des quiz');
    }
  },
  
  getQuizById: async (id: string) => {
    try {
      const response = await api.get(`/quizzes/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Quiz non trouvé');
    }
  },
  
  submitQuiz: async (quizId: string, answers: Record<string, string>) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/attempt/`, { answers });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la soumission du quiz');
    }
  },
  
  // Admin only
  createQuiz: async (quiz: any) => {
    try {
      const response = await api.post('/admin/quizzes/create/', quiz);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la création du quiz');
    }
  },
  
  updateQuiz: async (id: string, quiz: any) => {
    try {
      const response = await api.put(`/admin/quizzes/${id}/`, quiz);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour du quiz');
    }
  },
  
  deleteQuiz: async (id: string) => {
    try {
      await api.delete(`/admin/quizzes/${id}/`);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression du quiz');
    }
  },
  
  getAdminQuizzes: async () => {
    try {
      const response = await api.get('/admin/quizzes/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des quiz');
    }
  },

  getAdminQuizById: async (quizId: string) => {
    try {
      const response = await api.get(`/admin/quizzes/${quizId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du quiz');
    }
  }
};

// --- Admin Service ---
export const adminService = {
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des statistiques');
    }
  },
  
  getRecentActivity: async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await api.get('/admin/recent-activity/', {
        params: { page, page_size: pageSize }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de l\'activité récente');
    }
  },
  
  getUsers: async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await api.get('/admin/users/', {
        params: { page, page_size: pageSize }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des utilisateurs');
    }
  },
  
  createUser: async (userData: any) => {
    try {
      const response = await api.post('/admin/users/create/', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la création de l\'utilisateur');
    }
  },
  
  updateUser: async (userId: string, userData: any) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  },
  
  deleteUser: async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}/delete/`);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
  },

  getSecurityData: async () => {
    try {
      const response = await api.get('/admin/security/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des données de sécurité');
    }
  }
};

// --- Student Service ---
export const studentService = {
  getCertifications: async () => {
    try {
      const response = await api.get('/certifications/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des attestations');
    }
  },
  
  downloadCertificationPNG: async (certificationId: string) => {
    try {
      const response = await api.get(`/certifications/${certificationId}/png/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors du téléchargement du PNG');
    }
  },
  
  downloadCertificationPDF: async (certificationId: string) => {
    try {
      const response = await api.get(`/certifications/${certificationId}/pdf/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors du téléchargement du PDF');
    }
  }
};
