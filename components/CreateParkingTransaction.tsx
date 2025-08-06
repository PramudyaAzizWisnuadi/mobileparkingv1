import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ParkingTransaction, VehicleType } from '../services/api';
import { getPrinterConfig } from './PrinterSettings';
import { IconSymbol } from './ui/IconSymbol';

interface CreateParkingTransactionProps {
  onTransactionCreated?: (transaction: any) => void;
  onClose?: () => void;
}

export const CreateParkingTransaction: React.FC<CreateParkingTransactionProps> = ({
  onTransactionCreated,
  onClose
}) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<number | null>(null);
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVehicleTypes, setIsLoadingVehicleTypes] = useState(true);

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const loadVehicleTypes = async () => {
    try {
      setIsLoadingVehicleTypes(true);
      console.log('🔄 Loading vehicle types...');
      
      const types = await apiService.getVehicleTypes();
      console.log('✅ Vehicle types loaded:', types);
      
      // Sort vehicle types by ID ascending
      const sortedTypes = types.sort((a, b) => a.id - b.id);
      
      console.log('📋 Sorted vehicle types (by ID ASC):', sortedTypes);
      setVehicleTypes(sortedTypes);
      
      if (sortedTypes.length > 0) {
        setSelectedVehicleTypeId(sortedTypes[0].id);
        console.log('🎯 Default selected vehicle type:', sortedTypes[0]);
      }
    } catch (error: any) {
      console.error('❌ Error loading vehicle types:', error);
      Alert.alert('Error', `Gagal memuat jenis kendaraan: ${error.message}`);
    } finally {
      setIsLoadingVehicleTypes(false);
    }
  };

  const refreshVehicleTypes = async () => {
    console.log('🔄 Manual refresh vehicle types...');
    await loadVehicleTypes();
    Alert.alert('✅ Refresh Berhasil', 'Data jenis kendaraan telah diperbarui!');
  };

  const handleCreateTransaction = async () => {
    if (!selectedVehicleTypeId) {
      Alert.alert('Error', 'Silakan pilih jenis kendaraan');
      return;
    }

    try {
      setIsLoading(true);
      
      const transactionData: ParkingTransaction = {
        vehicle_type_id: selectedVehicleTypeId,
        license_plate: licensePlate.trim() || undefined,
      };

      const response = await apiService.createParkingTransaction(transactionData);

      // Auto print ticket after successful creation
      await printParkingTicket(response.data);

      // Callback dan reset form setelah print selesai
      onTransactionCreated?.(response.data);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', `Gagal membuat transaksi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setLicensePlate('');
    if (vehicleTypes.length > 0) {
      setSelectedVehicleTypeId(vehicleTypes[0].id);
    }
  };

  const getSelectedVehicleType = () => {
    return vehicleTypes.find(type => type.id === selectedVehicleTypeId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const testPrinterConfig = async () => {
    try {
      // Debug storage values
      const savedPrinterSettings = await AsyncStorage.getItem('printer_settings');
      const savedApiUrl = await AsyncStorage.getItem('api_url');
      
      console.log('🗄️ Raw Storage Values:');
      console.log('printer_settings:', savedPrinterSettings);
      console.log('api_url:', savedApiUrl);
      
      const printerConfig = await getPrinterConfig();
      
      const configInfo = `
🖨️ Debug Konfigurasi Printer:

🗄️ Storage Values:
• printer_settings: ${savedPrinterSettings ? 'ADA' : 'TIDAK ADA'}
• api_url: ${savedApiUrl ? 'ADA' : 'TIDAK ADA'}

✅ Pengaturan Tampilan:
• Nomor Tiket: ${printerConfig.showTicketNumber ? 'TAMPIL ❌' : 'SEMBUNYI ✅'}
• Tanggal/Waktu: ${printerConfig.showDateTime ? 'TAMPIL' : 'SEMBUNYI'}  
• Nomor Plat: ${printerConfig.showLicensePlate ? 'TAMPIL' : 'SEMBUNYI'}
• Tarif: ${printerConfig.showTariff ? 'TAMPIL' : 'SEMBUNYI'}

📋 Info Perusahaan:
• Nama: ${printerConfig.companyName}
• Alamat: ${printerConfig.address}
• Telepon: ${printerConfig.phone}

💬 Footer:
• Baris 1: ${printerConfig.footerMessage1}
• Baris 2: ${printerConfig.footerMessage2}  
• Baris 3: ${printerConfig.footerMessage3}
      `;
      
      Alert.alert('🔧 Debug Konfigurasi', configInfo.trim(), [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('❌ Error', 'Gagal mendapatkan konfigurasi printer: ' + error);
    }
  };

  const printParkingTicket = async (transactionData: any) => {
    try {
      // Load printer configuration
      const printerConfig = await getPrinterConfig();
      
      // Format tiket untuk keperluan printing - disesuaikan dengan versi web
      const vehicleType = getSelectedVehicleType();
      const currentDate = new Date();
      
      // Generate nomor tiket otomatis - prioritas field ticket_number atau no_tiket dari API
      const ticketNumber = transactionData.ticket_number || 
                          transactionData.no_tiket || 
                          transactionData.transaction_number ||
                          `PKR${String(transactionData.id).padStart(6, '0')}` ||
                          `PKR${Date.now().toString().slice(-6)}`;

      // Create HTML content with optimized thermal printer layout
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Tiket Parkir</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 4mm;
              font-size: 11px;
              line-height: 1.2;
              color: #000;
              background: #fff;
              width: 50mm;
            }
            
            .ticket {
              width: 100%;
              text-align: center;
            }
            
            .header {
              text-align: center;
              margin-bottom: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 6px;
            }
            
            .company-name {
              font-size: 14px;
              font-weight: bold;
              margin: 0 0 3px 0;
            }
            
            .ticket-title {
              font-size: 12px;
              font-weight: bold;
              margin: 3px 0;
            }
            
            .company-info {
              font-size: 9px;
              margin: 6px 0;
              text-align: center;
              line-height: 1.1;
            }
            
            .separator {
              border-top: 1px dashed #000;
              margin: 6px 0;
              height: 0;
            }
            
            .info-section {
              text-align: left;
              margin: 8px 0;
            }
            
            .info-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            
            .info-table td {
              padding: 1px 0;
              vertical-align: top;
            }
            
            .info-table .label {
              width: 40%;
              font-weight: bold;
            }
            
            .info-table .value {
              width: 60%;
              text-align: right;
              font-weight: normal;
            }
            
            .amount-section {
              text-align: center;
              margin: 8px 0;
              padding: 6px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              font-weight: bold;
              font-size: 12px;
            }
            
            .footer {
              text-align: center;
              font-size: 8px;
              margin-top: 8px;
              line-height: 1.1;
            }
            
            .footer p {
              margin: 1px 0;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="company-name">${printerConfig.companyName}</div>
              <div class="ticket-title">TIKET PARKIR</div>
            </div>
            
            <div class="company-info">
              ${printerConfig.address}<br/>
              ${printerConfig.phone}
            </div>
            
            <div class="separator"></div>
            
            <div class="info-section">
              <table class="info-table">
                ${printerConfig.showTicketNumber ? `
                <tr>
                  <td class="label">No. Tiket</td>
                  <td class="value">${ticketNumber}</td>
                </tr>
                ` : ''}
                ${printerConfig.showDateTime ? `
                <tr>
                  <td class="label">Tanggal</td>
                  <td class="value">${currentDate.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}</td>
                </tr>
                <tr>
                  <td class="label">Waktu</td>
                  <td class="value">${currentDate.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                ` : ''}
                <tr>
                  <td class="label">Kendaraan</td>
                  <td class="value">${vehicleType?.name || '-'}</td>
                </tr>
                ${printerConfig.showLicensePlate && licensePlate ? `
                <tr>
                  <td class="label">Plat</td>
                  <td class="value">${licensePlate}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${printerConfig.showTariff ? `
            <div class="amount-section">
              Tarif: ${vehicleType ? formatCurrency(vehicleType.flat_rate) : '-'}
            </div>
            ` : ''}
            
            <div class="separator"></div>
            
            <div class="footer">
              ${printerConfig.footerMessage1 ? `<p>${printerConfig.footerMessage1}</p>` : ''}
              ${printerConfig.footerMessage2 ? `<p>${printerConfig.footerMessage2}</p>` : ''}
              ${printerConfig.footerMessage3 ? `<p>${printerConfig.footerMessage3}</p>` : ''}
              ${printerConfig.showDateTime ? `
              <p>${currentDate.toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      // Print using expo-print with thermal printer optimized settings
      
      try {
        // Create PDF from HTML with thermal printer settings
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          width: 168, // 58mm in points (58mm * 2.83 = 164 points, rounded to 168)
          height: 400, // Longer height for content
          margins: {
            left: 8,
            right: 8,
            top: 8,
            bottom: 8,
          },
        });

        // Try to print directly
        await Print.printAsync({
          uri: uri,
        });

        // If we reach here, print was successful or user didn't cancel

        Alert.alert(
          '✅ Transaksi & Tiket Berhasil',
          `Transaksi parkir berhasil dibuat!\n\nTiket dengan nomor ${ticketNumber} telah berhasil dicetak dengan format optimal untuk thermal printer 58mm.`,
          [{ text: 'OK' }]
        );
        
      } catch (printError) {
        console.error('Print process error:', printError);
        
        // Try to share as fallback
        try {
          const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            width: 168, // 58mm in points
            height: 400,
            margins: {
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
            },
          });
          
          await shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Tiket Parkir - Pilih Printer atau Simpan'
          });
          
          Alert.alert(
            '✅ Transaksi Berhasil & PDF Dibuat',
            `Transaksi parkir berhasil dibuat!\n\nTiket dengan nomor ${ticketNumber} telah dibuat sebagai PDF. Anda dapat mencetak atau menyimpannya.`,
            [{ text: 'OK' }]
          );
          
        } catch (shareError) {
          console.error('Share error:', shareError);
          
          // Final fallback: Show formatted text
          const textTicket = `
${printerConfig.companyName}
TIKET PARKIR

${printerConfig.showTicketNumber ? `No. Tiket: ${ticketNumber}` : ''}
${printerConfig.showDateTime ? `Tanggal: ${currentDate.toLocaleDateString('id-ID')}
Jam: ${currentDate.toLocaleTimeString('id-ID')}` : ''}
Jenis: ${vehicleType?.name || '-'}
${printerConfig.showLicensePlate && licensePlate ? `Plat: ${licensePlate}` : ''}
${printerConfig.showTariff ? `Tarif: ${vehicleType ? formatCurrency(vehicleType.flat_rate) : '-'}` : ''}

PERHATIAN:
• Simpan tiket ini dengan baik
• Tunjukkan saat keluar parkir
          `;

          Alert.alert(
            '✅ Transaksi Berhasil',
            `Berikut data tiket untuk dicatat:\n${textTicket}`,
            [{ text: 'OK' }]
          );
        }
      }
      
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert(
        '⚠️ Peringatan Printer', 
        'Transaksi berhasil dibuat, tetapi terjadi masalah saat mencetak tiket.\n\nPastikan printer terhubung dan coba print ulang.',
        [
          { text: 'Batal' },
          { 
            text: 'Coba Lagi', 
            onPress: () => printParkingTicket(transactionData)
          }
        ]
      );
    }
  };

  if (isLoadingVehicleTypes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#228B22" />
        <Text style={styles.loadingText}>Memuat jenis kendaraan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconSymbol size={24} name="car.fill" color="#ffffff" />
          <Text style={styles.title}>Transaksi Parkir</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <IconSymbol size={18} name="car.fill" color="#333" />
            <Text style={styles.label}>Jenis Kendaraan *</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshVehicleTypes}
              disabled={isLoadingVehicleTypes}
            >
              {isLoadingVehicleTypes ? (
                <ActivityIndicator size="small" color="#228B22" />
              ) : (
                <IconSymbol size={16} name="arrow.clockwise" color="#228B22" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.vehicleTypeContainer}>
            {vehicleTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.vehicleTypeButton,
                  selectedVehicleTypeId === type.id && styles.vehicleTypeButtonSelected
                ]}
                onPress={() => setSelectedVehicleTypeId(type.id)}
                disabled={isLoading}
              >
                <View style={styles.vehicleTypeContent}>
                  <View style={styles.vehicleTypeHeader}>
                    <IconSymbol 
                      size={20} 
                      name={type.name.toLowerCase() === 'motor' ? 'bicycle' : 'car'} 
                      color={selectedVehicleTypeId === type.id ? '#228B22' : '#666'} 
                    />
                    <Text style={[
                      styles.vehicleTypeName,
                      selectedVehicleTypeId === type.id && styles.vehicleTypeNameSelected
                    ]}>
                      {type.name}
                    </Text>
                  </View>
                  <Text style={[
                    styles.vehicleTypePrice,
                    selectedVehicleTypeId === type.id && styles.vehicleTypePriceSelected
                  ]}>
                    {formatCurrency(type.flat_rate)}
                  </Text>
                </View>
                {selectedVehicleTypeId === type.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {getSelectedVehicleType()?.description && (
            <Text style={styles.description}>
              {getSelectedVehicleType()?.description}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <IconSymbol size={18} name="textformat.123" color="#333" />
            <Text style={styles.label}>Nomor Plat Kendaraan</Text>
          </View>
          <TextInput
            style={styles.input}
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="Masukkan plat nomor (opsional, contoh: B 1234 ABC)"
            autoCapitalize="characters"
            editable={!isLoading}
          />
        </View>

        {getSelectedVehicleType() && (
          <View style={styles.priceInfo}>
            <View style={styles.priceInfoContent}>
              <IconSymbol size={18} name="banknote" color="#228B22" />
              <Text style={styles.priceLabel}>Tarif</Text>
            </View>
            <Text style={styles.priceValue}>
              {formatCurrency(getSelectedVehicleType()!.flat_rate)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreateTransaction}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View style={styles.buttonContent}>
              <IconSymbol size={20} name="printer" color="#ffffff" />
              <Text style={styles.createButtonText}>Buat Transaksi & Cetak Tiket</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetForm}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <IconSymbol size={18} name="arrow.clockwise" color="#DC143C" />
            <Text style={styles.resetButtonText}>Reset Form</Text>
          </View>
        </TouchableOpacity>

        {/* Debug button untuk test konfigurasi printer */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: '#FF9500', marginTop: 10 }]}
          onPress={testPrinterConfig}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <IconSymbol size={18} name="info.circle" color="#FF9500" />
            <Text style={[styles.resetButtonText, { color: '#FF9500' }]}>Debug Config</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FFF8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  refreshButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  vehicleTypeContainer: {
    gap: 10,
  },
  vehicleTypeButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  vehicleTypeButtonSelected: {
    borderColor: '#228B22',
    backgroundColor: '#E8F5E8',
  },
  vehicleTypeContent: {
    flex: 1,
  },
  vehicleTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  vehicleTypeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  vehicleTypeNameSelected: {
    color: '#228B22',
  },
  vehicleTypePrice: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  vehicleTypePriceSelected: {
    color: '#228B22',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#228B22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#228B22',
  },
  priceInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#228B22',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
  },
  createButton: {
    backgroundColor: '#228B22',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
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
});
