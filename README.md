# ASK VALENTINA — Psychic Reading Platform

Powered by OnSpace.AI

A cross-platform psychic reading application that connects clients with Valentina, an experienced psychic medium. Built with Expo (React Native) and Supabase for real-time data, authentication, and payments via Stripe.

---

## Features

- **24/7 Psychic Readings**: Clients can submit questions any time
- **Flexible Pricing**: Tiered options — 1 question ($15), 2 questions ($25), or 3 questions ($40)
- **Topic Categories**: Love & Relationships, Career & Purpose, Family & Home, Spiritual Growth, Health & Wellness, Connect with Loved Ones, General Guidance
- **Personalized Experience**: Clients upload their photo + photos of people they want readings about
- **Real-time Status Tracking**: Pending → In Progress → Reading Complete
- **Stripe Payment Integration**: Secure checkout for all major cards (Visa, Mastercard, Amex)
- **Admin Dashboard**: PIN-protected admin panel for Valentina to manage and respond to readings
- **Deep Link Support**: Stripe redirect returns users to the app automatically
- **Push Notifications**: Admin can notify clients when their reading is complete
- **Cross-platform UI**: Works on iOS, Android, and Web via Expo

---

## Architecture Overview

```
┌─────────────────┐       ┌──────────────┐       ┌────────────┐
│   Client App     │       │ Stripe API   │       │  Supabase  │
│  (React Native)  │──────▶│ (Payments)   │       │  (DB/Auth) │
│                 │◀──────▶│              │       │            │
└────────┬────────┘       └──────────────┘       └─────┬──────┘
         │                                             │
         ▼                                             ▼
┌─────────────────┐       ┌──────────────┐       ┌────────────┐
│  Photo Storage   │       │Push Services │       │ FastAPI    │
│ (Supabase Buckets)│     │              │       │ (Functions)│
└─────────────────┘       └──────────────┘       └────────────┘
```

### Client App Screens (Expo Router)

| Route | Screen | Description |
|-------|--------|-------------|
| `/(tabs)/index` | Home | LANDING + "Ask for $15" button with testimonials/feature cards |
| `/(tabs)/readings` | My Readings | List of client's readings filtered by `user_id`, with status pills (Pending/Completed) and swipe to view |
| `/auth/signin` | Sign In | Email/password form with Google OAuth sign-in option |
| `/auth/signup` | Sign Up | Registration form with email + password, privacy/terms agreement |
| `/submit` | Submit Questions | Step 1 of 2: First Name, Last Initial, Phone, Client Photo, Subject Photos (optional), Topic Category, Questions (1–3) |
| `/payment` | Payment | Step 2 of 2: Stripe Checkout with order summary (topic, questions, price breakdown) |
| `/admin` | Admin Dashboard | **PIN Login** → Card list of all readings grouped by status, search by name/phone/topic/question, swipe to mark "In Progress" or "Read" |
| `/admin-answer` | Answer Reading | Shows questions with answer input fields per question |
| `/success` | Success | Confirmation screen after payment |
| `/reading/[id]` | Reading Detail | Individual reading view for both admin and client |

### Admin Access (Dashboard PIN)

**Current PIN**: `7777`  
Located in: `template/auth/admin-guard.tsx` — change it to secure your installation.

---

## Key Components & Services

### Storage Service (`template/storage-service.ts`)
- **Client Photos**: Uploaded to Supabase storage bucket `client_photos`, path `/clients/{user_id}/{timestamp}.jpg`
- **Subject Photos**: Uploaded to Supabase storage bucket `subject_photos`, path `/subjects/{user_id}/{timestamp}.jpg`
- Uses Expo Image Picker → resized/compressed → Base64 → Supabase Storage upload + generate public URL

### Payment Service (`template/payment-service.ts`)
- Calls `createPaymentSession(...)` which invokes the **Supabase Edge Function** at `https://<SUPABASE_URL>.netlify.app/functions/v1/create-payment`
- Supabase function creates a reading record in DB with `payment_status = 'unpaid'`, then creates Stripe Checkout session
- After payment, `verifyPayment(sessionId, readingId)` calls `supabase.functions.verify-payment` to confirm the payment and update status

### Admin Service (`components/AdminService.tsx`)
- `fetchAllReadings()`: Fetches readings via Supabase RPC `get_all_readings()` 
- `submitAnswers(readingId, answers)`: Updates reading in DB with admin-provided answers
- **Auth Flow**: PIN → `verifyAdminPin(pin)` checks against hardcoded value → stores in AsyncStorage for 24h

### Theme & Configuration (`constants/`)
```typescript
theme = {
  primary: '#D4AF37',       // Gold
  dark: '#0A0A1A',          // Deep navy/black
  accent: '#E8D5B7',        // Champagne/skin tone accent
  background: '#FDFCF7',    // Ivory warm white
  surface: '#FFFFFF',
  textPrimary: textPrimary,  // '#1A1A2E' or '#FFF9EF' (dark mode)
  success: '#4CAF50',
  error: '#E74C3C',
  gradientCard: [...]
}
```

---

## Database Schema (Supabase)

### `readings` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Auth user who paid |
| `client_name` | TEXT | Displayed name (e.g., "Sarah W.") |
| `client_phone` | TEXT | Phone for reading delivery |
| `topic` | TEXT | One of: love, career, family, spiritual, health, deceased, general |
| `questions` | JSONB | Array of question strings from client |
| `answers` | JSONB | Array of answer strings (populated by admin after reading) |
| `status` | TEXT | `pending`, `inProgress`, or `completed` |
| `amount` | INTEGER | Total charged in cents |
| `payment_status` | TEXT | `unpaid`, `paid`, `refunded` |
| `client_photo` | TEXT | Public URL to client's photo in storage |
| `subject_photos` | JSONB | Array of public URLs to subject photos |
| `stripe_session_id` | TEXT | Stripe checkout session ID |
| `push_token` | TEXT | For push notifications |
| `submitted_at` | TIMESTAMPTZ | When the reading request was submitted |
| `answered_at` | TIMESTAMPTZ | When the admin completed the reading |
| `created_at` | TIMESTAMPTZ | Record creation time |

### Supabase Storage Buckets

1. **`client_photos`** — Public, 5MB max per file
2. **`subject_photos`** — Public, 5MB max per file

### Supabase SQL (Required)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Readings table
CREATE TABLE readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'general',
  questions JSONB NOT NULL,
  answers JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending', -- pending | inProgress | completed
  amount INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'unpaid', -- unpaid | paid | refunded
  client_photo TEXT,
  subject_photos JSONB DEFAULT '[]',
  stripe_session_id TEXT,
  push_token TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_status ON readings(status);
CREATE INDEX idx_readings_payment_status ON readings(payment_status);
```

---

## Project File Structure

```
AskValentina_App/
├── app/                              # Expo Router pages
│   ├── (tabs)/                       # Tab Group
│   │   ├── index.tsx                 # Home screen — testimonials & CTA
│   │   ├── readings.tsx              # Client's reading history with status filters
│   │   ├── admin.tsx                 # Admin Dashboard: PIN login + reading list
│   │   └── _layout.tsx               # Bottom tab navigation (Ask Valentina, My Readings, Admin)
│   ├── auth/                         # Auth Group
│   │   ├── signin.tsx                # Email/Password sign-in screen
│   │   └── signup.tsx                # Registration with password + privacy agreement
│   ├── reading/[id].tsx              # Dynamic screen for individual reading detail
│   ├── submit.tsx                    # Question submission: name, photo upload, questions
│   ├── payment.tsx                   # Payment summary + Stripe checkout redirect
│   ├── admin-answer.tsx              # Admin answer input with per-question text fields
│   ├── success.tsx                   # Post-payment confirmation screen
│   ├── +not-found.tsx                # 404 fallback
│   └── _layout.tsx                   # Root layout, Providers (Supabase, QueryClient)
├── components/                       # Shared UI Components
│   ├── theme/                        # Theme system exports
│   │   ├── colors.ts                 # Color constants
│   │   ├── fonts.ts                  # Font definitions
│   │   └── index.ts                  # Unified Theme export (shadow, radius, etc.)
│   ├── feature/[...].tsx             # Business logic components (AdminService, PhotoViewer)
│   └── common/                       # Reusable UI: buttons, cards, modals
├── template/                         # Core Infrastructure Layer
│   ├── auth/                         # Auth modules
│   │   ├── admin-guard.tsx           # Admin gateway with PIN verification component
│   │   └── auth-service.ts           # Email/pass, Google OAuth, OTP, session management
│   ├── payment-service.ts            # createPaymentSession + verifyPayment via Supabase Edge Functions
│   ├── storage-service.ts            # Photo upload to Supabase Storage (client + subject photos)
│   └── ...                           # Other infrastructure
├── template/app.json                 # Expo app config (name, scheme, splash screen, icon)
```

---

## Setup Instructions

### 1. Environment Variables (.env file)

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<YOUR-SUPABASE-PROJECT>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<YOUR-SUPABASE-ANON-KEY>
SUPABASE_EDGE_FUNCTION_URL=https://<YOUR-SUPABASE-PROJECT>.netlify.app/functions/v1
STRIPE_SECRET_KEY=sk_live_<YOUR-STRIPE-SECRET-KEY>
```

### 2. Supabase Setup

1. Create a [Supabase](https://supabase.com) project
2. Add the `readings` table (schema above)
3. Enable **Authentication** with Email + Google OAuth providers
4. Create two storage buckets:
   - `client_photos` — public, 5MB limit
   - `subject_photos` — public, 5MB limit
5. Set up Row Level Security (RLS) policies on the `readings` table

### 3. Stripe Setup

1. Create a [Stripe](https://stripe.com) account
2. Create three **Price** products:
   - 1 Question Reading → `$15.00` (e.g., `price_1TO2R4QdPVYZ96GxX4plTGfg`)
   - 2 Questions Reading → `$25.00` (e.g., `price_1TO2REQdPVYZ96GxqeeQXZU7`)
   - 3 Questions Reading → `$40.00` (e.g., `price_1TO2RNQdPVYZ96Gxr5rlLdR3`)
3. Update `app/submit.tsx` price mapping + `create-payment` function with your Price IDs
4. Set your Stripe Secret Key in `.env`

### 4. Dependencies

```bash
npm install expo@^53.0.0 react-native @supabase/supabase-js stripe expo-router expo-linear-gradient @expo/vector-icons expo-image react-native-reanimated react-native-safe-area-context @react-native-async-storage/async-storage @react-navigation/native expo-auth-session expo-web-browser expo-image-picker expo-secure-store expo-haptics
```

### 5. Change Admin PIN

Edit the PIN in `template/auth/admin-guard.tsx`:

```typescript
const ADMIN_PIN = 'YOUR_NEW_PIN'; // ← change this
```

---

## Pricing Tiers (Stripe)

| Questions | Price | Stripe Price ID |
|-----------|-------|-----------------|
| 1         | $15   | `price_1TO2R4QdPVYZ96GxX4plTGfg` |
| 2         | $25   | `price_1TO2REQdPVYZ96GxqeeQXZU7` |
| 3         | $40   | `price_1TO2RNQdPVYZ96Gxr5rlLdR3` |

---

## Flow Diagram

```
Home Screen
    │
    ├─▶ "Ask for $15" button
    │       │
    │       ▼
    │   Submit Questions (Step 1 of 2)
    │       - First Name + Last Initial
    │       - Phone Number
    │       - Client Photo (required)
    │       - Subject Photos (optional, up to 5)
    │       - Topic Category selection
    │       - Enter Questions (1–3)
    │       │
    │       ▼
    │   Payment (Step 2 of 2)
    │       - Order Summary
    │       - Stripe Checkout
    │       │
    │       ▼
    │   Success Screen
    │       → Client redirected back to "My Readings"
    │
    ├─▶ "My Readings" tab (authenticated users only)
    │       │
    │       ▼
    │   Reading List with Filters:
    │       • All / Pending / Complete
    │       - Swipe → View/Re-answer
    │       - Status pill: Awaiting / In Progress / Complete
    │
    └─▶ "Admin" tab (PIN-protected)
            │
            ▼
        Admin Login
            - PIN: 7777 (change this!)
            │
            ▼
        Admin Dashboard
            - Stats overview (Pending/Completed/Total)
            - Filter list of all paid readings
            - Search by name, phone, topic, question
            - Swipe on reading card → Answer
                │
                ▼
            Answer Reading Screen
                - View client info + photos
                - Enter answers per question
                - Submit (marks as "completed", notifies client)
```

---

## Tech Stack Summary

| Category | Technology |
|----------|-----------|
| Framework | Expo SDK 53, React Native |
| Navigation | expo-router |
| State | React Context API |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Email + Google OAuth + OTP) |
| Storage | Supabase Storage (client_photos, subject_photos buckets) |
| Payments | Stripe Checkout |
| Styling | StyleSheet + Custom Theme |
| Animations | react-native-reanimated |
| Haptics | expo-haptics |
| Auth Session | expo-auth-session + expo-secure-store |
| Images | expo-image-picker + @expo/vector-icons |

---

## Security Notes

1. **Never commit `.env`** — it contains your Supabase keys and Stripe secret key
2. **Change the default admin PIN** (`7777`) before deploying to production
3. **RLS**: Set up Row Level Security policies on `readings` table so users can only see their own readings
4. **Stripe webhook**: For production, set up a webhook to listen for `checkout.session.completed` events
5. **Admin access**: Consider moving PIN verification from client-side to server-side (Supabase Edge Function) for stronger security

---

## License & Attribution

Powered by OnSpace.AI — AskValentina Psychic Platform  
© All rights reserved.
