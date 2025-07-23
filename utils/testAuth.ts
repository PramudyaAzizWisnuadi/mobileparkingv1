/**
 * Utility untuk testing API authentication
 * Gunakan file ini untuk menguji koneksi ke API server
 */

import { apiService } from '../services/api';

// Test credentials (ganti dengan credentials yang valid)
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

/**
 * Test koneksi ke API login
 */
export const testApiConnection = async () => {
  console.log('🔄 Testing API connection...');
  console.log('📍 API URL:', 'http://192.168.9.76:8000/api/v1/login');
  
  try {
    const response = await fetch('http://192.168.9.76:8000/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📋 Response data:', data);
    
    if (response.ok) {
      console.log('✅ API connection successful!');
      return { success: true, data };
    } else {
      console.log('❌ API connection failed');
      return { success: false, error: data };
    }
  } catch (error: any) {
    console.log('💥 Network error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

/**
 * Test login menggunakan apiService
 */
export const testLogin = async (credentials = TEST_CREDENTIALS) => {
  console.log('🔄 Testing login with apiService...');
  
  try {
    const response = await apiService.login(credentials);
    console.log('✅ Login successful:', response);
    return response;
  } catch (error) {
    console.log('❌ Login failed:', error);
    throw error;
  }
};

/**
 * Test apakah user sudah authenticated
 */
export const testAuthStatus = async () => {
  console.log('🔄 Testing authentication status...');
  
  try {
    const isAuth = await apiService.isAuthenticated();
    console.log('🔐 Is authenticated:', isAuth);
    return isAuth;
  } catch (error) {
    console.log('💥 Auth check error:', error);
    return false;
  }
};

/**
 * Test logout
 */
export const testLogout = async () => {
  console.log('🔄 Testing logout...');
  
  try {
    await apiService.logout();
    console.log('✅ Logout successful');
    return true;
  } catch (error) {
    console.log('💥 Logout error:', error);
    return false;
  }
};

/**
 * Test full authentication flow
 */
export const testFullAuthFlow = async () => {
  console.log('🚀 Starting full authentication flow test...');
  
  try {
    // 1. Test API connection
    console.log('\n1️⃣ Testing API connection...');
    await testApiConnection();
    
    // 2. Test login
    console.log('\n2️⃣ Testing login...');
    await testLogin();
    
    // 3. Test auth status
    console.log('\n3️⃣ Testing auth status...');
    await testAuthStatus();
    
    // 4. Test logout
    console.log('\n4️⃣ Testing logout...');
    await testLogout();
    
    // 5. Test auth status after logout
    console.log('\n5️⃣ Testing auth status after logout...');
    await testAuthStatus();
    
    console.log('\n🎉 Full authentication flow test completed!');
    return true;
    
  } catch (error) {
    console.log('\n💥 Full authentication flow test failed:', error);
    return false;
  }
};

/**
 * Cara menggunakan:
 * 
 * 1. Import di file yang ingin test:
 *    import { testApiConnection, testFullAuthFlow } from './utils/testAuth';
 * 
 * 2. Panggil function test:
 *    testApiConnection();
 *    atau
 *    testFullAuthFlow();
 * 
 * 3. Lihat hasil di console
 */
