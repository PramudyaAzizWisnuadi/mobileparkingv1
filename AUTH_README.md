# Parkir App - Authentication System

Sistem autentikasi lengkap untuk aplikasi Parkir menggunakan React Native Expo dengan TypeScript.

## Fitur Autentikasi

- ✅ Login dengan email dan password
- ✅ Penyimpanan token otomatis menggunakan AsyncStorage
- ✅ Auto-redirect berdasarkan status autentikasi
- ✅ Context API untuk manajemen state global
- ✅ Logout dengan konfirmasi
- ✅ Loading states dan error handling
- ✅ Protected routes dengan AuthGuard
- ✅ API service untuk request yang terautentikasi

## Struktur File

```
├── services/
│   └── api.ts                 # Service untuk API calls
├── contexts/
│   └── AuthContext.tsx        # Context untuk manajemen auth state
├── components/
│   └── AuthGuard.tsx          # Component untuk melindungi routes
├── hooks/
│   └── useApi.ts              # Custom hook untuk API calls
├── app/
│   ├── _layout.tsx            # Root layout dengan AuthProvider
│   ├── index.tsx              # Splash/redirect page
│   ├── login.tsx              # Halaman login
│   └── (tabs)/
│       └── index.tsx          # Home page dengan user info
```

## Penggunaan

### 1. AuthContext

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  // Login
  const handleLogin = async () => {
    try {
      await login({ email: "user@example.com", password: "password" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
  };
}
```

### 2. API Service

```tsx
import { apiService } from "@/services/api";

// Login
const response = await apiService.login({
  email: "user@example.com",
  password: "password",
});

// Authenticated request
const data = await apiService.makeAuthenticatedRequest("/some-endpoint", {
  method: "GET",
});

// Check if authenticated
const isAuth = await apiService.isAuthenticated();
```

### 3. Custom Hook useApi

```tsx
import { useApi } from "@/hooks/useApi";

function MyComponent() {
  const { loading, error, makeAuthenticatedRequest } = useApi();

  const fetchData = async () => {
    try {
      const data = await makeAuthenticatedRequest("/data");
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error.message}</Text>}
      <Button title="Fetch Data" onPress={fetchData} />
    </View>
  );
}
```

## Konfigurasi API

Ubah URL API di file `services/api.ts`:

```tsx
const API_BASE_URL = "http://192.168.9.76:8000/api/v1";
```

## Format Response API

### Login Response

```json
{
  "success": true,
  "data": {
    "token": "your-jwt-token",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "Login successful"
}
```

### Profile Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Endpoints yang Digunakan

- `POST /login` - Login user
- `POST /logout` - Logout user (optional)

## Keamanan

- Token disimpan secara aman menggunakan AsyncStorage
- Automatic token cleanup saat logout
- Request headers otomatis menyertakan Authorization token
- Auto-redirect ke login jika token expired (401 response)

## Flow Autentikasi

1. User membuka app → `index.tsx` mengecek status auth
2. Jika belum login → redirect ke `/login`
3. User input credentials → panggil API login
4. Jika berhasil → simpan token & user data dari response login → redirect ke `/(tabs)`
5. AuthGuard melindungi protected routes
6. Token digunakan untuk semua API calls selanjutnya
7. Jika token expired → auto logout & redirect ke login

## Pengembangan Lebih Lanjut

Anda dapat menambahkan fitur:

- Register/signup
- Forgot password
- Refresh token mechanism
- Biometric authentication
- Social login (Google, Facebook, etc.)
- Remember me functionality
