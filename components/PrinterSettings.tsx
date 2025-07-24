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
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
      }
    } catch (error) {
      console.error('Error loading printer config:', error);
      Alert.alert('Error', 'Gagal memuat pengaturan printer');
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('printer_settings', JSON.stringify(config));
      Alert.alert(
        '✅ Berhasil',
        'Pengaturan copywriting tiket berhasil disimpan!',
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

  const previewTicket = () => {
    const previewText = `
${config.companyName}
TIKET PARKIR

${config.address}
${config.phone}

----------------------------
No. Tiket: PKR001234
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
            Pastikan informasi perusahaan sudah benar sebelum menyimpan.
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
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      return { ...DEFAULT_CONFIG, ...parsedConfig };
    }
    return DEFAULT_CONFIG;
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
});
