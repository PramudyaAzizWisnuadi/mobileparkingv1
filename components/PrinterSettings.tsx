import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

interface PrinterSettingsConfig {
  companyName: string;
  address: string;
  phone: string;
  footerMessage1: string;
  footerMessage2: string;
  footerMessage3: string;
  showDateTime: boolean;
  showLicensePlate: boolean;
  showTariff: boolean;
  showTicketNumber: boolean;
  apiUrl: string;
}

const DEFAULT_CONFIG: PrinterSettingsConfig = {
  companyName: 'MD MALL BLORA',
  address: 'Jl. Raya Blora No. 123',
  phone: 'Telp: (0296) 123456',
  footerMessage1: 'Terima kasih',
  footerMessage2: 'Simpan tiket ini',
  footerMessage3: 'Tunjukkan saat keluar',
  showDateTime: true,
  showLicensePlate: true,
  showTariff: true,
  showTicketNumber: true,
  apiUrl: 'https://testapi.mdgroup.id/api/v1',
};

interface PrinterSettingsProps {
  onClose?: () => void;
}

export const PrinterSettings: React.FC<PrinterSettingsProps> = ({ onClose }) => {
  const [config, setConfig] = useState<PrinterSettingsConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('printer_settings');
      const savedApiUrl = await AsyncStorage.getItem('api_url');
      
      let parsedConfig = DEFAULT_CONFIG;
      if (savedConfig) {
        parsedConfig = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      }
      
      // Load API URL separately
      if (savedApiUrl) {
        parsedConfig.apiUrl = savedApiUrl;
      }
      
      setConfig(parsedConfig);
    } catch (error) {
      console.error('Error loading printer config:', error);
      Alert.alert('Error', 'Gagal memuat pengaturan printer');
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);
      
      // Save printer settings (without apiUrl)
      const { apiUrl, ...printerConfig } = config;
      await AsyncStorage.setItem('printer_settings', JSON.stringify(printerConfig));
      
      // Save API URL separately
      await AsyncStorage.setItem('api_url', apiUrl);
      
      Alert.alert(
        '✅ Berhasil',
        'Pengaturan printer dan API berhasil disimpan!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving printer config:', error);
      Alert.alert('Error', 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      '⚠️ Konfirmasi Reset',
      'Apakah Anda yakin ingin mengembalikan pengaturan ke default?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setConfig(DEFAULT_CONFIG);
            Alert.alert('✅ Reset Berhasil', 'Pengaturan telah dikembalikan ke default');
          },
        },
      ]
    );
  };

  const testApiConnection = async () => {
    try {
      Alert.alert('🔄 Testing', 'Sedang menguji koneksi API...');
      
      const testUrl = config.apiUrl.replace(/\/$/, '');
      console.log('🧪 Testing API URL:', testUrl);
      
      // Test dengan endpoint /login untuk POST
      const loginTestUrl = `${testUrl}/login`;
      console.log('🧪 Testing LOGIN endpoint:', loginTestUrl);
      
      const response = await fetch(loginTestUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test'
        }),
      });
      
      console.log('🧪 Test Response Status:', response.status);
      console.log('🧪 Test Response URL:', response.url);
      console.log('🧪 Test Response Redirected:', response.redirected);
      
      if (response.status === 422 || response.status === 401) {
        // These are valid responses from login endpoint, means server is working
        Alert.alert('✅ Koneksi Berhasil', 'Server API dapat diakses dengan baik (login endpoint responded)');
      } else if (response.ok) {
        Alert.alert('✅ Koneksi Berhasil', 'Server API dapat diakses dengan baik');
      } else {
        Alert.alert('⚠️ Peringatan', `Server merespons dengan status: ${response.status}`);
      }
    } catch (error) {
      console.error('API connection test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        '❌ Koneksi Gagal', 
        'Tidak dapat terhubung ke server API. Periksa URL dan koneksi internet Anda.\n\nError: ' + errorMessage
      );
    }
  };

  const debugCurrentApiUrl = async () => {
    try {
      const savedApiUrl = await AsyncStorage.getItem('api_url');
      const defaultUrl = 'https://testapi.mdgroup.id/api/v1';
      
      const debugInfo = `
📋 Debug Info URL API:

🔧 URL dari form: ${config.apiUrl}
💾 URL tersimpan: ${savedApiUrl || 'Tidak ada'}
🏠 URL default: ${defaultUrl}
✅ URL yang akan digunakan: ${savedApiUrl || defaultUrl}

🎯 Test URLs:
- Login: ${(savedApiUrl || defaultUrl)}/login
- Vehicle Types: ${(savedApiUrl || defaultUrl)}/vehicle-types

⚠️ Pastikan URL tidak ada trailing slash (/) di akhir
⚠️ Gunakan HTTPS untuk menghindari redirect
      `;
      
      Alert.alert('🐛 Debug API URL', debugInfo.trim(), [
        { text: 'OK' },
        { 
          text: 'Copy URL Login', 
          onPress: () => {
            // In real app, you might want to copy to clipboard
            console.log('Login URL:', (savedApiUrl || defaultUrl) + '/login');
          }
        }
      ]);
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('❌ Error', 'Gagal mendapatkan debug info');
    }
  };

  const clearApiCache = async () => {
    Alert.alert(
      '🗑️ Clear Cache API',
      'Apakah Anda yakin ingin menghapus cache API URL dan reset ke default HTTPS?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('api_url');
              setConfig(prev => ({ ...prev, apiUrl: 'https://testapi.mdgroup.id/api/v1' }));
              Alert.alert('✅ Cache Cleared', 'Cache API URL telah dihapus dan reset ke HTTPS default');
            } catch (error) {
              console.error('Error clearing API cache:', error);
              Alert.alert('❌ Error', 'Gagal menghapus cache API');
            }
          }
        }
      ]
    );
  };

  const previewTicket = () => {
    const previewText = `
${config.companyName}
TIKET PARKIR

${config.address}
${config.phone}

----------------------------
${config.showTicketNumber ? 'No. Tiket: PKR001234' : ''}
${config.showDateTime ? 'Tanggal: 23/07/2025\nWaktu: 14:30' : ''}
Kendaraan: Motor
${config.showLicensePlate ? 'Plat: B 1234 ABC' : ''}
${config.showTariff ? 'Tarif: Rp 2.000' : ''}
----------------------------

${config.footerMessage1}
${config.footerMessage2}
${config.footerMessage3}
    `;

    Alert.alert('🎫 Preview Tiket', previewText.trim(), [{ text: 'OK' }]);
  };

  const updateConfig = (key: keyof PrinterSettingsConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconSymbol size={24} name="gearshape.fill" color="#ffffff" />
          <Text style={styles.title}>Pengaturan Copywriting Tiket</Text>
        </View>
      </View>

      <View style={styles.form}>
        {/* Company Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol size={20} name="building.2" color="#228B22" />
            <Text style={styles.sectionTitle}>Informasi Perusahaan</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nama Perusahaan *</Text>
            <TextInput
              style={styles.input}
              value={config.companyName}
              onChangeText={(value) => updateConfig('companyName', value)}
              placeholder="Contoh: MD MALL BLORA"
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Alamat *</Text>
            <TextInput
              style={styles.input}
              value={config.address}
              onChangeText={(value) => updateConfig('address', value)}
              placeholder="Contoh: Jl. Raya Blora No. 123"
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={styles.input}
              value={config.phone}
              onChangeText={(value) => updateConfig('phone', value)}
              placeholder="Contoh: Telp: (0296) 123456"
              maxLength={50}
            />
          </View>
        </View>

        {/* API Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol size={20} name="network" color="#FF6B35" />
            <Text style={styles.sectionTitle}>Pengaturan Server API</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>URL Server API *</Text>
            <TextInput
              style={styles.input}
              value={config.apiUrl}
              onChangeText={(value) => updateConfig('apiUrl', value)}
              placeholder="Contoh: https://192.168.1.100:8000/api/v1"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helpText}>
              Masukkan URL lengkap server API (tanpa slash di akhir)
              {'\n'}Contoh: https://192.168.1.100:8000/api/v1
              {'\n'}Atau: https://yourapi.com/api/v1
              {'\n'}⚠️ Gunakan HTTPS untuk menghindari redirect
            </Text>
          </View>

          <TouchableOpacity
            style={styles.testButton}
            onPress={() => testApiConnection()}
          >
            <IconSymbol size={16} name="checkmark.circle" color="#FFF" />
            <Text style={styles.testButtonText}>Test Koneksi API</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#FF9500' }]}
            onPress={() => debugCurrentApiUrl()}
          >
            <IconSymbol size={16} name="info.circle" color="#FFF" />
            <Text style={styles.testButtonText}>Debug URL API</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#DC143C' }]}
            onPress={() => clearApiCache()}
          >
            <IconSymbol size={16} name="trash" color="#FFF" />
            <Text style={styles.testButtonText}>Clear Cache API</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol size={20} name="text.bubble" color="#228B22" />
            <Text style={styles.sectionTitle}>Pesan Footer</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pesan Baris 1</Text>
            <TextInput
              style={styles.input}
              value={config.footerMessage1}
              onChangeText={(value) => updateConfig('footerMessage1', value)}
              placeholder="Contoh: Terima kasih"
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pesan Baris 2</Text>
            <TextInput
              style={styles.input}
              value={config.footerMessage2}
              onChangeText={(value) => updateConfig('footerMessage2', value)}
              placeholder="Contoh: Simpan tiket ini"
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pesan Baris 3</Text>
            <TextInput
              style={styles.input}
              value={config.footerMessage3}
              onChangeText={(value) => updateConfig('footerMessage3', value)}
              placeholder="Contoh: Tunjukkan saat keluar"
              maxLength={50}
            />
          </View>
        </View>

        {/* Display Options Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol size={20} name="eye" color="#228B22" />
            <Text style={styles.sectionTitle}>Opsi Tampilan</Text>
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <IconSymbol size={18} name="calendar" color="#666" />
              <Text style={styles.switchLabel}>Tampilkan Tanggal & Waktu</Text>
            </View>
            <Switch
              value={config.showDateTime}
              onValueChange={(value) => updateConfig('showDateTime', value)}
              trackColor={{ false: '#ddd', true: '#228B22' }}
              thumbColor={config.showDateTime ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <IconSymbol size={18} name="textformat.123" color="#666" />
              <Text style={styles.switchLabel}>Tampilkan Nomor Plat</Text>
            </View>
            <Switch
              value={config.showLicensePlate}
              onValueChange={(value) => updateConfig('showLicensePlate', value)}
              trackColor={{ false: '#ddd', true: '#228B22' }}
              thumbColor={config.showLicensePlate ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <IconSymbol size={18} name="dollarsign.circle" color="#666" />
              <Text style={styles.switchLabel}>Tampilkan Tarif</Text>
            </View>
            <Switch
              value={config.showTariff}
              onValueChange={(value) => updateConfig('showTariff', value)}
              trackColor={{ false: '#ddd', true: '#228B22' }}
              thumbColor={config.showTariff ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabelContainer}>
              <IconSymbol size={18} name="number.circle" color="#666" />
              <Text style={styles.switchLabel}>Tampilkan Nomor Tiket</Text>
            </View>
            <Switch
              value={config.showTicketNumber}
              onValueChange={(value) => updateConfig('showTicketNumber', value)}
              trackColor={{ false: '#ddd', true: '#228B22' }}
              thumbColor={config.showTicketNumber ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={previewTicket}
            disabled={isSaving}
          >
            <View style={styles.buttonContent}>
              <IconSymbol size={18} name="eye.fill" color="#228B22" />
              <Text style={styles.previewButtonText}>Preview Tiket</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToDefault}
            disabled={isSaving}
          >
            <View style={styles.buttonContent}>
              <IconSymbol size={18} name="arrow.clockwise" color="#DC143C" />
              <Text style={styles.resetButtonText}>Reset Default</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={saveConfig}
            disabled={isSaving}
          >
            <View style={styles.buttonContent}>
              <IconSymbol size={18} name="checkmark.circle.fill" color="#ffffff" />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <IconSymbol size={18} name="info.circle" color="#666" />
            <Text style={styles.infoTitle}>Informasi</Text>
          </View>
          <Text style={styles.infoText}>
            Pengaturan ini akan mempengaruhi tampilan copywriting pada semua tiket yang dicetak.
            Anda dapat mengatur informasi perusahaan, pesan footer, dan opsi tampilan seperti nomor tiket, tanggal/waktu, nomor plat, dan tarif.
            Pastikan informasi sudah benar sebelum menyimpan.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Fungsi untuk mengambil konfigurasi printer (digunakan oleh komponen lain)
export const getPrinterConfig = async (): Promise<PrinterSettingsConfig> => {
  try {
    const savedConfig = await AsyncStorage.getItem('printer_settings');
    const savedApiUrl = await AsyncStorage.getItem('api_url');
    
    let config = DEFAULT_CONFIG;
    
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      config = { ...DEFAULT_CONFIG, ...parsedConfig };
    }
    
    // Load API URL separately if exists
    if (savedApiUrl) {
      config.apiUrl = savedApiUrl;
    }
    
    return config;
  } catch (error) {
    console.error('Error getting printer config:', error);
    return DEFAULT_CONFIG;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFF8',
  },
  header: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#228B22',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },
  previewButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#228B22',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#228B22',
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#DC143C',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#DC143C',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoSection: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#228B22',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
