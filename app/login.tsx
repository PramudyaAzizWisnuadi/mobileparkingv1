import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        '⚠️ Data Tidak Lengkap',
        'Harap isi email dan password untuk melanjutkan.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        '📧 Format Email Salah',
        'Pastikan email yang Anda masukkan memiliki format yang benar.\n\nContoh: user@email.com',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await login({
        email: email.trim(),
        password: password,
      });

      if (response.success) {
        // Success will be handled by AuthContext redirect
        Alert.alert(
          '✅ Login Berhasil',
          'Selamat datang di Parkir App!',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error: any) {
      // Show error as user-friendly alert
      let title = '❌ Login Gagal';
      let message = error.message || 'Terjadi kesalahan saat login';
      
      // Customize alert based on error type
      if (message.includes('koneksi') || message.includes('terhubung')) {
        title = '🌐 Masalah Koneksi';
        message = 'Tidak dapat terhubung ke server.\n\nPastikan koneksi internet Anda stabil dan coba lagi.';
      } else if (message.includes('email') || message.includes('password')) {
        title = '🔐 Data Login Salah';
        message = 'Email atau password yang Anda masukkan salah.\n\nSilakan periksa kembali dan coba lagi.';
      } else if (message.includes('server') || message.includes('gangguan')) {
        title = '🔧 Server Bermasalah';
        message = 'Server sedang mengalami gangguan.\n\nSilakan coba lagi dalam beberapa menit.';
      } else if (message.includes('sesi') || message.includes('berakhir')) {
        title = '⏰ Sesi Berakhir';
        message = 'Sesi login Anda telah berakhir.\n\nSilakan login kembali untuk melanjutkan.';
      }
      
      Alert.alert(
        title,
        message,
        [
          { 
            text: 'Coba Lagi', 
            style: 'default',
            onPress: () => {
              // Clear form if needed
              if (title.includes('Data Login Salah')) {
                setPassword('');
              }
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Parkir App</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => Alert.alert('Info', 'Forgot password feature will be implemented')}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFF8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 30,
    shadowColor: '#228B22',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#228B22',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#DC143C',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#228B22',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8F5E8',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8FFF8',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#228B22',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#228B22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#DC143C',
    fontSize: 16,
    fontWeight: '500',
  },
});
