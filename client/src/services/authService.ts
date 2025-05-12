import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    player: {
      id: string;
      username: string;
      email: string;
      userType: string;
      status: string;
      gold: number;
      diamond: number;
    };
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);
      if (response.data.success && response.data.data.token) {

        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('player', JSON.stringify(response.data.data.player));
      }
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'LOGIN_FAILED',
          message: error.response?.data?.error?.message || 'Login failed. Please try again.'
        }
      };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'REGISTRATION_FAILED',
          message: error.response?.data?.error?.message || 'Registration failed. Please try again.'
        }
      };
    }
  },

  async verifyToken(token?: string): Promise<AuthResponse> {
    try {
      const tokenToVerify = token || this.getCurrentToken();
      if (!tokenToVerify) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'No token available to verify'
          }
        };
      }

      const response = await axios.post(`${API_URL}/auth/verify-token`, { token: tokenToVerify });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'TOKEN_VERIFICATION_FAILED',
          message: error.response?.data?.error?.message || 'Token verification failed'
        }
      };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('player');
  },

  getCurrentToken() {
    return localStorage.getItem('token');
  },

  getCurrentPlayer() {
    const player = localStorage.getItem('player');
    return player ? JSON.parse(player) : null;
  },

  isAuthenticated() {
    return !!this.getCurrentToken();
  }
}; 