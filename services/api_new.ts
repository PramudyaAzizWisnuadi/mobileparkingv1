import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_BASE_URL = 'http://testapi.mdgroup.id/api/v1';

// Function to get API base URL from settings
async function getApiBaseUrl(): Promise<string> {
  try {
    const savedApiUrl = await AsyncStorage.getItem('api_url');
    if (savedApiUrl && savedApiUrl.trim()) {
      // Remove trailing slash if present
      return savedApiUrl.replace(/\/$/, '');
    }
    return DEFAULT_API_BASE_URL;
  } catch (error) {
    console.warn('Failed to get API URL from settings:', error);
    return DEFAULT_API_BASE_URL;
  }
}

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
      const apiBaseUrl = await getApiBaseUrl();
      const loginUrl = `${apiBaseUrl}/login`;
      console.log('🚀 Login Request Details:');
      console.log('URL:', loginUrl);
      console.log('Method: POST');
      console.log('Credentials:', credentials);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('📡 Response Details:');
      console.log('Status:', response.status);
      console.log('StatusText:', response.statusText);
      console.log('URL after fetch:', response.url);

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
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.');
      }
      
      // Handle timeout errors  
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Koneksi terputus saat login. Periksa jaringan internet Anda.');
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getToken();
      
      if (token) {
        // Optional: Call logout endpoint if your API has one
        const apiBaseUrl = await getApiBaseUrl();
        await fetch(`${apiBaseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error on logout - just log it
      // User should still be logged out locally even if server call fails
    } finally {
      await this.removeToken();
    }
  }

  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }

      const apiBaseUrl = await getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        // Token expired or invalid
        await this.removeToken();
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.');
      }

      if (response.status === 403) {
        throw new Error('Anda tidak memiliki akses untuk melakukan tindakan ini.');
      }

      if (response.status === 404) {
        throw new Error('Data yang diminta tidak ditemukan.');
      }

      if (response.status === 422) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          throw new Error(`Data tidak valid: ${errorMessages.join(', ')}`);
        }
        throw new Error('Data yang dikirim tidak valid. Periksa kembali form Anda.');
      }

      if (response.status === 429) {
        throw new Error('Terlalu banyak permintaan. Harap tunggu sebentar sebelum mencoba lagi.');
      }

      if (response.status >= 500) {
        throw new Error('Server sedang mengalami gangguan. Coba lagi dalam beberapa menit.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat memproses permintaan Anda.');
      }

      return data;
    } catch (error) {
      console.error('Authenticated request error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.');
      }
      
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Koneksi terputus. Periksa jaringan internet Anda.');
      }
      
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    try {
      console.log('🌐 Fetching vehicle types from API...');
      const response = await this.makeAuthenticatedRequest('/vehicle-types?order_by=id&order_direction=asc', {
        method: 'GET',
      });

      console.log('📡 API Response for vehicle types:', response);

      if (response.success && response.data) {
        console.log('✅ Vehicle types received:', response.data.length, 'items');
        return response.data;
      }

      throw new Error('Gagal memuat daftar jenis kendaraan. Silakan coba lagi.');
    } catch (error: any) {
      console.error('❌ Get vehicle types error:', error);
      
      // Handle specific cases for vehicle types
      if (error.message.includes('tidak dapat terhubung') || error.message.includes('koneksi')) {
        throw new Error('Tidak dapat memuat jenis kendaraan. Periksa koneksi internet Anda.');
      }
      
      if (error.message.includes('server') || error.message.includes('gangguan')) {
        throw new Error('Server sedang bermasalah. Jenis kendaraan tidak dapat dimuat saat ini.');
      }
      
      throw new Error(error.message || 'Gagal memuat jenis kendaraan. Silakan restart aplikasi dan coba lagi.');
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

      throw new Error('Gagal membuat transaksi parkir. Silakan coba lagi.');
    } catch (error: any) {
      console.error('Create parking transaction error:', error);
      
      // Handle specific cases for parking transactions
      if (error.message.includes('tidak dapat terhubung') || error.message.includes('koneksi')) {
        throw new Error('Tidak dapat membuat transaksi. Periksa koneksi internet Anda dan coba lagi.');
      }
      
      if (error.message.includes('server') || error.message.includes('gangguan')) {
        throw new Error('Server sedang bermasalah. Transaksi tidak dapat diproses saat ini.');
      }
      
      if (error.message.includes('berakhir') || error.message.includes('login')) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali untuk membuat transaksi.');
      }
      
      if (error.message.includes('tidak valid')) {
        throw new Error('Data transaksi tidak valid. Periksa kembali jenis kendaraan dan plat nomor.');
      }
      
      throw new Error(error.message || 'Gagal membuat transaksi parkir. Pastikan semua data sudah benar dan coba lagi.');
    }
  }
}

export const apiService = new ApiService();
