/**
 * Contoh penggunaan sistem autentikasi Parkir App
 * 
 * File ini berisi contoh-contoh penggunaan berbagai fitur auth
 */

import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

// Contoh 1: Menggunakan useAuth hook
export const ExampleAuthUsage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Contoh mengecek status user
  if (isLoading) {
    console.log('Sedang memuat...');
    return;
  }

  if (isAuthenticated && user) {
    console.log(`User logged in: ${user.name} (${user.email})`);
  } else {
    console.log('User belum login');
  }
};

// Contoh 2: Menggunakan API service langsung
export const ExampleApiServiceUsage = async () => {
  try {
    // Login
    const loginResponse = await apiService.login({
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResponse);

    // Make authenticated request
    const data = await apiService.makeAuthenticatedRequest('/some-endpoint', {
      method: 'GET'
    });
    console.log('API response:', data);

    // Check authentication status
    const isAuth = await apiService.isAuthenticated();
    console.log('Is authenticated:', isAuth);

    // Logout
    await apiService.logout();
    console.log('Logged out successfully');

  } catch (error) {
    console.error('API error:', error);
  }
};

// Contoh 3: Menggunakan useApi hook
export const ExampleUseApiHook = () => {
  const { loading, error, makeAuthenticatedRequest } = useApi();

  const fetchParkingData = async () => {
    try {
      const parkingData = await makeAuthenticatedRequest('/parking-spots');
      console.log('Parking data:', parkingData);
    } catch (err) {
      console.error('Failed to fetch parking data:', err);
    }
  };

  if (loading) {
    console.log('API request sedang berjalan...');
  }

  if (error) {
    console.error('API error:', error.message);
  }

  return {
    fetchParkingData
  };
};

// Contoh 4: Error handling yang baik
export const ExampleErrorHandling = () => {
  const { login } = useAuth();

  const handleLoginWithErrorHandling = async (email: string, password: string) => {
    try {
      await login({ email, password });
      console.log('Login berhasil!');
    } catch (error: any) {
      // Handle different types of errors
      if (error.message.includes('401')) {
        console.error('Email atau password salah');
      } else if (error.message.includes('network')) {
        console.error('Tidak dapat terhubung ke server');
      } else if (error.message.includes('timeout')) {
        console.error('Request timeout, coba lagi');
      } else {
        console.error('Terjadi kesalahan:', error.message);
      }
    }
  };

  return { handleLoginWithErrorHandling };
};

// Contoh 5: Menggunakan auth untuk conditional rendering
export const ExampleConditionalRendering = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return { component: 'LoadingSpinner' };
  }

  if (!isAuthenticated) {
    return { component: 'LoginScreen' };
  }

  return {
    component: 'HomeScreen',
    props: {
      userName: user?.name,
      userEmail: user?.email
    }
  };
};
