import { useCallback, useState } from 'react';
import { apiService } from '../services/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = useCallback(async (
    apiCall: () => Promise<any>,
    options?: UseApiOptions
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper methods for common API calls
  const makeAuthenticatedRequest = useCallback((
    endpoint: string,
    options?: RequestInit
  ) => {
    return call(() => apiService.makeAuthenticatedRequest(endpoint, options));
  }, [call]);

  const getVehicleTypes = useCallback(() => {
    return call(() => apiService.getVehicleTypes());
  }, [call]);

  const createParkingTransaction = useCallback((transaction: any) => {
    return call(() => apiService.createParkingTransaction(transaction));
  }, [call]);

  return {
    loading,
    error,
    call,
    makeAuthenticatedRequest,
    getVehicleTypes,
    createParkingTransaction,
  };
};
