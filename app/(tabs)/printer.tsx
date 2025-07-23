import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PrinterStatus {
  isConnected: boolean;
  model: string;
  lastChecked: Date;
  bluetoothAddress?: string;
  bluetoothName?: string;
}

interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  isConnected: boolean;
  signalStrength?: number;
}

export default function PrinterStatusScreen() {
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const checkPrinterStatus = async () => {
    setIsChecking(true);
    try {
      // Simulate printer status check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock printer status - akan diupdate ketika library Bluetooth sudah siap
      // Untuk simulasi realistis, default tidak terhubung
      const mockStatus: PrinterStatus = {
        isConnected: false, // Realistis: default tidak terhubung
        model: '', // Kosong jika tidak terhubung
        lastChecked: new Date(),
      };
      
      setPrinterStatus(mockStatus);
      
      if (!mockStatus.isConnected) {
        // Tidak perlu alert karena status tidak terhubung adalah kondisi normal
        console.log('Printer status: Tidak terhubung');
      }
    } catch (error) {
      console.error('Failed to check printer status:', error);
      Alert.alert('Error', 'Gagal mengecek status printer.');
    } finally {
      setIsChecking(false);
    }
  };

  const testPrint = async () => {
    if (!printerStatus?.isConnected) {
      Alert.alert('Error', 'Printer tidak terhubung.');
      return;
    }

    setIsTestPrinting(true);
    try {
      // Simulate test print - akan diupdate dengan fungsi Bluetooth
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Alert.alert(
        'Test Print',
        'Test print berhasil!\n\nCek apakah tiket test sudah keluar dari printer.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to test print:', error);
      Alert.alert('Error', 'Gagal melakukan test print.');
    } finally {
      setIsTestPrinting(false);
    }
  };

  const scanForPrinters = async () => {
    setIsScanning(true);
    try {
      // Simulate scanning for Bluetooth devices
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Realistis: tidak ada mock devices - akan kosong sampai integrasi Bluetooth real
      const mockDevices: BluetoothDevice[] = [];
      
      setAvailableDevices(mockDevices);
    } catch (error) {
      console.error('Failed to scan for printers:', error);
      Alert.alert('Error', 'Gagal mencari printer.');
    } finally {
      setIsScanning(false);
    }
  };

  const connectToPrinter = async (device: BluetoothDevice) => {
    setIsConnecting(device.id);
    try {
      // Simulate connecting to printer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update printer status
      const connectedStatus: PrinterStatus = {
        isConnected: true,
        model: device.name,
        lastChecked: new Date(),
        bluetoothAddress: device.address,
        bluetoothName: device.name,
      };
      
      setPrinterStatus(connectedStatus);
      setShowDeviceList(false);
      
      Alert.alert(
        'Berhasil Terhubung',
        `Printer ${device.name} berhasil terhubung!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      Alert.alert('Error', 'Gagal menghubungkan ke printer.');
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectPrinter = () => {
    Alert.alert(
      'Putuskan Koneksi',
      'Apakah Anda yakin ingin memutuskan koneksi printer?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Putuskan',
          style: 'destructive',
          onPress: () => {
            const disconnectedStatus: PrinterStatus = {
              isConnected: false,
              model: '', // Kosong jika tidak terhubung
              lastChecked: new Date(),
            };
            setPrinterStatus(disconnectedStatus);
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    if (!printerStatus) return '#666';
    return printerStatus.isConnected ? '#4CAF50' : '#F44336';
  };

  useEffect(() => {
    checkPrinterStatus();
  }, []);

  useEffect(() => {
    if (showDeviceList) {
      scanForPrinters();
    }
  }, [showDeviceList]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol size={48} name="printer" color="#228B22" />
        <Text style={styles.title}>Status Printer</Text>
        <Text style={styles.subtitle}>Monitor kondisi printer thermal</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusLabel}>
              {printerStatus?.isConnected ? 'Terhubung' : 'Tidak Terhubung'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, isChecking && styles.refreshButtonDisabled]}
            onPress={checkPrinterStatus}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="#228B22" />
            ) : (
              <IconSymbol size={20} name="arrow.clockwise" color="#228B22" />
            )}
          </TouchableOpacity>
        </View>

        {printerStatus && (
          <>
            {printerStatus.isConnected && printerStatus.model && (
              <View style={styles.infoRow}>
                <IconSymbol size={20} name="printer" color="#666" />
                <Text style={styles.infoLabel}>Model:</Text>
                <Text style={styles.infoValue}>{printerStatus.model}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <IconSymbol size={20} name="clock" color="#666" />
              <Text style={styles.infoLabel}>Terakhir Cek:</Text>
              <Text style={styles.infoValue}>
                {printerStatus.lastChecked.toLocaleTimeString('id-ID')}
              </Text>
            </View>

            {!printerStatus.isConnected && (
              <View style={styles.notConnectedMessage}>
                <IconSymbol size={16} name="exclamationmark.triangle" color="#FF9800" />
                <Text style={styles.notConnectedText}>
                  Untuk menggunakan printer, pastikan device Bluetooth aktif
                </Text>
              </View>
            )}

            {printerStatus.isConnected && (
              <View style={styles.connectedMessage}>
                <IconSymbol size={16} name="checkmark.circle" color="#228B22" />
                <Text style={styles.connectedText}>
                  Terhubung: {printerStatus.bluetoothName}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isChecking && styles.buttonDisabled]}
          onPress={checkPrinterStatus}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol size={20} name="arrow.clockwise" color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {isChecking ? 'Mengecek...' : 'Refresh Status'}
          </Text>
        </TouchableOpacity>

        {!printerStatus?.isConnected ? (
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={() => setShowDeviceList(true)}
          >
            <IconSymbol size={20} name="plus.circle" color="#fff" />
            <Text style={styles.buttonText}>Hubungkan Printer</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.button, 
                styles.secondaryButton, 
                isTestPrinting && styles.buttonDisabled
              ]}
              onPress={testPrint}
              disabled={isTestPrinting}
            >
              {isTestPrinting ? (
                <ActivityIndicator size="small" color="#228B22" />
              ) : (
                <IconSymbol size={20} name="printer" color="#228B22" />
              )}
              <Text style={[styles.buttonText, { color: '#228B22' }]}>
                {isTestPrinting ? 'Mencetak...' : 'Test Print'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={disconnectPrinter}
            >
              <IconSymbol size={20} name="xmark.circle" color="#fff" />
              <Text style={styles.buttonText}>Putuskan Koneksi</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>Informasi:</Text>
        
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>•</Text>
          <Text style={styles.helpText}>
            Fitur pencarian printer sedang dalam tahap pengembangan
          </Text>
        </View>
        
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>•</Text>
          <Text style={styles.helpText}>
            Saat ini belum ada printer yang akan ditemukan saat scanning
          </Text>
        </View>
        
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>•</Text>
          <Text style={styles.helpText}>
            Integrasi Bluetooth akan ditambahkan untuk koneksi printer sebenarnya
          </Text>
        </View>
        
        <View style={styles.helpItem}>
          <Text style={styles.helpNumber}>•</Text>
          <Text style={styles.helpText}>
            Tiket parkir saat ini dicetak sebagai log console untuk testing
          </Text>
        </View>
      </View>

      {/* Modal untuk daftar printer */}
      <Modal
        visible={showDeviceList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeviceList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Printer</Text>
              <TouchableOpacity
                onPress={() => setShowDeviceList(false)}
                style={styles.closeButton}
              >
                <IconSymbol size={24} name="xmark" color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.scanButton, isScanning && styles.buttonDisabled]}
              onPress={scanForPrinters}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#228B22" />
              ) : (
                <IconSymbol size={20} name="magnifyingglass" color="#228B22" />
              )}
              <Text style={[styles.buttonText, { color: '#228B22' }]}>
                {isScanning ? 'Mencari...' : 'Cari Printer'}
              </Text>
            </TouchableOpacity>

            <ScrollView style={styles.deviceList}>
              {availableDevices.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol size={48} name="printer" color="#ccc" />
                  <Text style={styles.emptyText}>
                    {isScanning ? 'Mencari printer...' : 'Tidak ada printer ditemukan'}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {isScanning 
                      ? 'Memindai perangkat Bluetooth di sekitar'
                      : 'Pastikan printer Bluetooth sudah dinyalakan dan dalam mode pairing'
                    }
                  </Text>
                </View>
              ) : (
                availableDevices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceItem}
                    onPress={() => connectToPrinter(device)}
                    disabled={isConnecting === device.id}
                  >
                    <View style={styles.deviceInfo}>
                      <IconSymbol size={24} name="printer" color="#007AFF" />
                      <View style={styles.deviceText}>
                        <Text style={styles.deviceName}>{device.name}</Text>
                        <Text style={styles.deviceAddress}>{device.address}</Text>
                      </View>
                      <View style={styles.deviceStatus}>
                        <View style={styles.signalBars}>
                          {[1, 2, 3, 4].map((bar) => (
                            <View
                              key={bar}
                              style={[
                                styles.signalBar,
                                {
                                  backgroundColor:
                                    (device.signalStrength || 0) >= bar * 25
                                      ? '#4CAF50'
                                      : '#E0E0E0',
                                },
                              ]}
                            />
                          ))}
                        </View>
                        {isConnecting === device.id ? (
                          <ActivityIndicator size="small" color="#007AFF" />
                        ) : (
                          <IconSymbol size={16} name="chevron.right" color="#666" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFF8',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  notConnectedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  notConnectedText: {
    fontSize: 14,
    color: '#F57F17',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  connectedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#228B22',
  },
  connectedText: {
    fontSize: 14,
    color: '#228B22',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  actionButtons: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#228B22',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#228B22',
  },
  connectButton: {
    backgroundColor: '#228B22',
  },
  dangerButton: {
    backgroundColor: '#DC143C',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  helpCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  helpNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#228B22',
    width: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#228B22',
    borderRadius: 8,
  },
  deviceList: {
    maxHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  deviceItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  deviceText: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deviceStatus: {
    alignItems: 'center',
  },
  signalBars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  signalBar: {
    width: 3,
    height: 8,
    marginHorizontal: 1,
    borderRadius: 1,
  },
});
