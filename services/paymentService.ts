// Powered by OnSpace.AI
// ASK VALENTINA — Payment Service

import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';

const supabase = getSupabaseClient();

export interface CreatePaymentParams {
  clientName: string;
  clientPhone: string;
  topic: string;
  questions: string[];
  questionCount: number;
  clientPhoto?: string;
  subjectPhotos?: string[];
  pushToken?: string;
}

export interface CreatePaymentResult {
  url: string;
  readingId: string;
  sessionId: string;
}

export async function createPaymentSession(
  params: CreatePaymentParams
): Promise<{ data: CreatePaymentResult | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: params,
  });

  if (error) {
    let errorMessage = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const textContent = await error.context?.text();
        const statusCode = error.context?.status ?? 500;
        errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
      } catch {
        errorMessage = `${error.message || 'Failed to read response'}`;
      }
    }
    return { data: null, error: errorMessage };
  }

  return { data, error: null };
}

export async function verifyPayment(
  sessionId: string,
  readingId: string
): Promise<{ data: any | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke('verify-payment', {
    body: { sessionId, readingId },
  });

  if (error) {
    let errorMessage = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const textContent = await error.context?.text();
        const statusCode = error.context?.status ?? 500;
        errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
      } catch {
        errorMessage = `${error.message || 'Failed to read response'}`;
      }
    }
    return { data: null, error: errorMessage };
  }

  return { data, error: null };
}

export async function fetchReadings(): Promise<{ data: any[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('payment_status', 'paid')
    .order('submitted_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function fetchReadingById(id: string): Promise<{ data: any | null; error: string | null }> {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
