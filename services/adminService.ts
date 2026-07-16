// Powered by OnSpace.AI
// ASK VALENTINA — Admin Service

import { getSupabaseClient } from '@/template';
import { FunctionsHttpError } from '@supabase/supabase-js';

const supabase = getSupabaseClient();

// Admin PIN — Valentina sets this. Change to your own secure PIN.
const ADMIN_PIN = '7777';

export function verifyAdminPin(pin: string): boolean {
  return pin === ADMIN_PIN;
}

export async function fetchAllReadings(): Promise<{ data: any[] | null; error: string | null }> {
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

export async function submitAnswers(
  readingId: string,
  answers: string[]
): Promise<{ data: any | null; error: string | null }> {
  const { data, error } = await supabase
    .from('readings')
    .update({
      answers,
      status: 'completed',
      answered_at: new Date().toISOString(),
    })
    .eq('id', readingId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // Trigger push notification
  const { error: notifError } = await supabase.functions.invoke('send-notification', {
    body: { readingId },
  });

  if (notifError) {
    let errorMessage = notifError.message;
    if (notifError instanceof FunctionsHttpError) {
      try {
        const textContent = await notifError.context?.text();
        errorMessage = textContent || notifError.message;
      } catch {
        errorMessage = notifError.message;
      }
    }
    console.log('Notification send warning:', errorMessage);
    // Don't fail the answer submission if notification fails
  }

  return { data, error: null };
}

export async function updateReadingStatus(
  readingId: string,
  status: 'pending' | 'inProgress' | 'completed'
): Promise<{ data: any | null; error: string | null }> {
  const updateData: Record<string, any> = { status };

  if (status === 'completed') {
    updateData.answered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('readings')
    .update(updateData)
    .eq('id', readingId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  // Trigger push notification for status change
  const { error: notifError } = await supabase.functions.invoke('send-notification', {
    body: { readingId },
  });

  if (notifError) {
    console.log('Notification warning:', notifError.message);
  }

  return { data, error: null };
}
