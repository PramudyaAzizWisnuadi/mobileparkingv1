import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.9.76:8000/api/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface VehicleType {
  id: number;
  name: string;
  price_per_hour: number;
  flat_rate: number;
  description?: string;
}

export interface ParkingTransaction {
  vehicle_type_id: number;
  license_plate?: string;
}

class ApiService {
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        await this.setToken(data.data.token);
        return data;
      }

      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Email atau password salah. Silakan periksa kembali kredensial Anda.');
      }

      if (response.status === 422) {
        // Validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(errorMessages.join('. '));
        }
        throw new Error(data.message || 'Data yang dimasukkan tidak valid.');
      }

      if (response.status === 429) {
        throw new Error('Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.');
      }

      if (response.status >= 500) {
        throw new Error('Server sedang bermasalah. Silakan coba lagi nanti.');
      }

      // Default error message
      throw new Error(data.message || 'Login gagal. Silakan periksa koneksi internet Anda.');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      
      if (token) {
        // Optional: Call logout endpoint if your API has one
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.removeToken();
    }
  }

  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const token = await this.getToken();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        await this.removeToken();
        throw new Error('Authentication failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    try {
      const response = await this.makeAuthenticatedRequest('/vehicle-types', {
        method: 'GET',
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch vehicle types');
    } catch (error) {
      console.error('Get vehicle types error:', error);
      throw error;
    }
  }

  async createParkingTransaction(transaction: ParkingTransaction): Promise<any> {
    try {
      const response = await this.makeAuthenticatedRequest('/parking', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });

      if (response.success) {
        return response;
      }

      throw new Error(response.message || 'Failed to create parking transaction');
    } catch (error) {
      console.error('Create parking transaction error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
