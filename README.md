# ArenaX

A mobile app for organizing gaming tournaments and managing participant registrations. Built with Expo, React Native, and Supabase.

## Features

- Create tournaments with name, game, date, location or online format, cover image, and max participant count
- Browse and search open tournaments by name, game, or location
- Apply to join tournaments; track your application status (Pending, Accepted, Rejected)
- Organizer dashboard to review applications, accept/reject players, edit tournament details, and manually close applications
- Co-organizer support — tournament owners can add co-organizers who get full management access
- Applications auto-close once a tournament reaches its max participant count
- Role-based access — a user can be an organizer on one tournament and a participant on another at the same time

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo Go app on your device, or an Android/iOS simulator

### Setup

Clone the repo and install dependencies:

```
npm install
```

Create a Supabase project, run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor, then copy your credentials into a `.env` file (see `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Start the dev server:

```
npx expo start
```

Scan the QR code with Expo Go or press `a` / `i` for Android / iOS simulator.

## Project Structure

```
app/
  index.tsx                 # Auth redirect entry point
  (auth)/                   # Welcome, login & register screens
  (tabs)/                   # Main tab navigator (Discover, Tournaments, Dashboard, Create, Profile)
  (tabs)/tournaments/[id].tsx      # Tournament detail screen
  (tabs)/tournaments/my-applications.tsx  # User's own applications
  (tabs)/dashboard/edit/[id].tsx   # Edit tournament screen
  (tabs)/create/                   # 3-step tournament creation wizard
lib/
  auth.ts              # Supabase auth helpers (sign up, sign in, sign out)
  api.ts               # REST API helpers (PostgREST wrapper)
  tournaments.ts        # Tournament CRUD + management queries
  applications.ts       # Application CRUD queries
  profiles.ts           # Profile lookup and update helpers
  storage.ts            # Cover image upload
context/               # Auth context + Create Tournament wizard context
components/            # Shared UI components
```

## Roles

| Role | Can do |
|---|---|
| User | Create tournaments, browse tournaments, apply to join, track own applications |
| Organizer (owner) | Everything a user can do, plus: manage applications (accept/reject) for owned tournaments, edit tournament details, close applications, add co-organizers, delete tournament (before it starts) |
| Co-organizer | Manage applications (accept/reject), edit tournament details, close applications — for tournaments they've been added to |

## Students

- Valentina Stanković 2022/0306
- Nikola Todorović 2022/0044