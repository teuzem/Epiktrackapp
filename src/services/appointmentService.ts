import { supabase } from '../lib/supabase';

export const getAvailableDoctors = async () => {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*, profile:profiles(*)');
  
  return { data, error };
};

interface CreateAppointmentArgs {
  parentId: string;
  doctorId: string;
  childId: string;
  scheduledAt: string;
  fee: number;
  paymentReference: string;
  predictionId?: string;
}

export const createAppointmentAfterPayment = async (args: CreateAppointmentArgs) => {
  const { parentId, doctorId, childId, scheduledAt, fee, paymentReference, predictionId } = args;

  // 1. Create the appointment
  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      parent_id: parentId,
      doctor_id: doctorId,
      child_id: childId,
      prediction_id: predictionId,
      scheduled_at: scheduledAt,
      duration_minutes: 30,
      consultation_type: 'video',
      status: 'confirmed',
      fee_amount: fee,
    })
    .select()
    .single();

  if (appointmentError) {
    console.error('Error creating appointment:', appointmentError);
    throw new Error("Impossible de créer le rendez-vous.");
  }

  // 2. Create the payment record
  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .insert({
      appointment_id: appointmentData.id,
      parent_id: parentId,
      amount: fee,
      currency: 'XAF',
      payment_method: 'card',
      payment_provider: 'paystack',
      reference: paymentReference,
      status: 'success',
      paid_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (paymentError) {
    console.error('Error creating payment record:', paymentError);
    // Non-critical, log and continue
  }

  // 3. Create the invoice record
  const { error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      appointment_id: appointmentData.id,
      payment_id: paymentData?.id,
      parent_id: parentId,
      amount: fee,
      status: 'paid',
      issued_at: new Date().toISOString(),
      due_at: new Date().toISOString(), // Paid immediately
    });

  if (invoiceError) {
    console.error('Error creating invoice record:', invoiceError);
    // Non-critical, log and continue
  }

  return appointmentData;
};
