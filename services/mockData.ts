
// Powered by OnSpace.AI
// ASK VALENTINA — Mock Data

export interface Reading {
  id: string;
  clientName: string;
  clientPhone: string;
  topic: string;
  questions: string[];
  answers: string[];
  status: 'pending' | 'inProgress' | 'completed';
  submittedAt: string;
  answeredAt?: string;
  amount: number;
  paymentStatus: 'paid';
  clientPhoto?: string;
  subjectPhotos?: string[];
}

export const mockReadings: Reading[] = [
  {
    id: 'r1',
    clientName: 'Sarah',
    clientPhone: '+1 555-0101',
    topic: 'love',
    questions: ['Will I find love this year?'],
    answers: ['I sense a strong romantic energy entering your life very soon. Spirit is showing me the month of March as particularly significant. Keep your heart open — someone from your past may re-emerge with new intentions. Trust the signs the universe sends you.'],
    status: 'completed',
    submittedAt: '2025-01-10T14:30:00Z',
    answeredAt: '2025-01-10T16:45:00Z',
    amount: 15,
    paymentStatus: 'paid',
  },
  {
    id: 'r2',
    clientName: 'Michael',
    clientPhone: '+1 555-0102',
    topic: 'career',
    questions: ['Should I take the new job offer?', 'What does my career path look like in 2025?'],
    answers: [
      'Spirit is guiding me to tell you that this new opportunity aligns deeply with your soul\'s purpose. I see growth and fulfillment ahead. The energy around this decision is very positive — trust your gut instinct.',
      'I see 2025 as a year of transformation for your professional life. By summer, you\'ll be stepping into a leadership role that feels natural. Financial abundance follows this shift.',
    ],
    status: 'completed',
    submittedAt: '2025-01-09T10:15:00Z',
    answeredAt: '2025-01-09T14:00:00Z',
    amount: 30,
    paymentStatus: 'paid',
  },
  {
    id: 'r3',
    clientName: 'Jessica',
    clientPhone: '+1 555-0103',
    topic: 'deceased',
    questions: ['Is my grandmother watching over me?', 'Does she have a message for me?', 'Is she at peace?'],
    answers: [],
    status: 'pending',
    submittedAt: '2025-01-11T08:00:00Z',
    amount: 45,
    paymentStatus: 'paid',
  },
  {
    id: 'r4',
    clientName: 'David',
    clientPhone: '+1 555-0104',
    topic: 'spiritual',
    questions: ['What is my spirit animal?'],
    answers: [],
    status: 'inProgress',
    submittedAt: '2025-01-11T06:30:00Z',
    amount: 15,
    paymentStatus: 'paid',
  },
  {
    id: 'r5',
    clientName: 'Emma',
    clientPhone: '+1 555-0105',
    topic: 'family',
    questions: ['Will my daughter and I reconcile?', 'What can I do to heal our relationship?'],
    answers: [
      'I feel a strong bond between you and your daughter that transcends any temporary distance. Spirit shows me reconciliation coming through an unexpected conversation — possibly around a family event. The love between you never faded.',
      'Spirit is guiding you to lead with vulnerability. Write her a letter from your heart — even if you don\'t send it right away. The energy you put into those words will shift things.',
    ],
    status: 'completed',
    submittedAt: '2025-01-08T20:00:00Z',
    answeredAt: '2025-01-09T09:30:00Z',
    amount: 30,
    paymentStatus: 'paid',
  },
  {
    id: 'r6',
    clientName: 'Aisha',
    clientPhone: '+1 555-0106',
    topic: 'health',
    questions: ['What should I focus on for my well-being this year?'],
    answers: [],
    status: 'pending',
    submittedAt: '2025-01-11T09:15:00Z',
    amount: 15,
    paymentStatus: 'paid',
  },
  {
    id: 'r7',
    clientName: 'Carlos',
    clientPhone: '+1 555-0107',
    topic: 'general',
    questions: ['What does Spirit want me to know right now?', 'Am I on the right path?'],
    answers: [
      'Spirit is showing me that you\'ve been carrying a heavy burden of self-doubt. Release it. The universe has been sending you confirmation signs — you\'ve been noticing repeating numbers for a reason.',
      'You are exactly where you need to be. The detour you thought was a mistake? It was preparation. Trust the timing of your life.',
    ],
    status: 'completed',
    submittedAt: '2025-01-07T15:45:00Z',
    answeredAt: '2025-01-07T19:00:00Z',
    amount: 30,
    paymentStatus: 'paid',
  },
];
