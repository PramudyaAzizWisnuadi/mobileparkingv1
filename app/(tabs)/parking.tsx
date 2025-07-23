import React from 'react';
import { CreateParkingTransaction } from '../../components/CreateParkingTransaction';

export default function ParkingScreen() {
  const handleTransactionCreated = (transaction: any) => {
    // Transaction completed successfully
    // The CreateParkingTransaction component will handle the success message
  };

  return (
    <CreateParkingTransaction
      onTransactionCreated={handleTransactionCreated}
    />
  );
}
