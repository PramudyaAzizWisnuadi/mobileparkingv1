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
import { apiService, ParkingTransaction, VehicleType } from '../services/api';
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
      const types = await apiService.getVehicleTypes();
      
      // Sort vehicle types: Motor first, then others
      const sortedTypes = types.sort((a, b) => {
        const aIsMotor = a.name.toLowerCase().includes('motor') || a.name.toLowerCase().includes('sepeda motor');
        const bIsMotor = b.name.toLowerCase().includes('motor') || b.name.toLowerCase().includes('sepeda motor');
        
        if (aIsMotor && !bIsMotor) return -1; // Motor comes first
        if (!aIsMotor && bIsMotor) return 1;  // Motor comes first
        return a.name.localeCompare(b.name);  // Alphabetical for same type
      });
      
      setVehicleTypes(sortedTypes);
      if (sortedTypes.length > 0) {
        setSelectedVehicleTypeId(sortedTypes[0].id);
      }
    } catch (error: any) {
      Alert.alert('Error', `Gagal memuat jenis kendaraan: ${error.message}`);
    } finally {
      setIsLoadingVehicleTypes(false);
    }
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

      Alert.alert(
        'Berhasil',
        'Transaksi parkir berhasil dibuat dan tiket sedang dicetak!',
        [
          {
            text: 'OK',
            onPress: () => {
              onTransactionCreated?.(response.data);
              resetForm();
            }
          }
        ]
      );
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

  const printParkingTicket = async (transactionData: any) => {
    try {
      // Format tiket untuk keperluan printing
      const vehicleType = getSelectedVehicleType();
      const currentDate = new Date();
      
      const ticketContent = `
================================
        TIKET PARKIR
================================
No. Transaksi: ${transactionData.id || 'N/A'}
Tanggal: ${currentDate.toLocaleDateString('id-ID')}
Jam Masuk: ${currentDate.toLocaleTimeString('id-ID')}

Jenis Kendaraan: ${vehicleType?.name || '-'}
Plat Nomor: ${licensePlate || 'Tidak ada'}

Tarif Flat: ${vehicleType ? formatCurrency(vehicleType.flat_rate) : '-'}

================================
   Simpan tiket ini dengan baik
     Tunjukkan saat keluar
================================
      `;

      // Untuk development - log tiket content
      console.log('Printing ticket:', ticketContent);

      Alert.alert(
        'Berhasil',
        'Tiket parkir berhasil dibuat!\n\nTiket akan dicetak melalui printer thermal 58mm.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert(
        'Warning', 
        'Transaksi berhasil dibuat, tetapi gagal mencetak tiket.\n\nPastikan printer terhubung dan kertas tersedia.'
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
              <IconSymbol size={18} name="dollarsign.circle" color="#228B22" />
              <Text style={styles.priceLabel}>Tarif Flat:</Text>
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
