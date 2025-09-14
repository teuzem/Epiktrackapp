import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import { CreditCard } from 'lucide-react';

interface PaymentButtonProps {
  email: string;
  amount: number;
  onSuccess: (reference: string) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ email, amount, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!paystackPublicKey) {
    console.error("Paystack public key is not defined.");
    return <p className="text-red-500 text-center">La configuration du paiement est manquante.</p>;
  }

  const config = {
    reference: new Date().getTime().toString(),
    email,
    amount,
    publicKey: paystackPublicKey,
    currency: 'XAF',
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    setIsLoading(true);
    initializePayment({
      onSuccess: (reference) => {
        setIsLoading(false);
        onSuccess(reference.reference);
      },
      onClose: () => {
        setIsLoading(false);
        toast.error('Paiement annulé.');
      },
    });
  };

  return (
    <Button onClick={handlePayment} isLoading={isLoading}>
      <CreditCard className="mr-2 h-5 w-5" />
      Payer maintenant
    </Button>
  );
};

export default PaymentButton;
