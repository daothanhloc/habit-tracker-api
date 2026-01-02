# Habit Tracker App

A Progressive Web App (PWA) for tracking habits, maintaining consistency, and achieving your goals. Built with React, TypeScript, Tailwind CSS v4, and designed to work seamlessly on both desktop and mobile devices.

## Features

- **Habit Management**: Create, edit, and delete habits with customizable colors and categories
- **Habit Tracking**: Log habit completions with optional notes and timestamps
- **Streak Tracking**: View current and longest streaks to stay motivated
- **Goal Setting**: Set weekly, monthly, or yearly consistency goals
- **Visual Calendar**: Month view showing your habit completion history
- **Notifications**: Browser notifications to remind you to track habits
- **Progressive Web App**: Install on your device for an app-like experience
- **Mobile-First Design**: Responsive interface optimized for mobile and desktop
- **Offline Support**: Service worker caching for offline functionality

## Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin
- **State Management**: Zustand
- **API Client**: Axios
- **Date Utilities**: date-fns
- **Icons**: lucide-react
- **PWA**: vite-plugin-pwa with Workbox

## Prerequisites

- Node.js (v22.9.0 or higher recommended)
- npm (v10.8.3 or higher)
- A running instance of the Habit Tracker API (see API Configuration below)

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the API URL in `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

   **Important**: The `VITE_` prefix is required for Vite to expose environment variables to the client.

## API Configuration

This frontend application requires the Habit Tracker API to be running. The API provides endpoints for:

- Habit CRUD operations
- Habit tracking and history
- Streak calculations
- Goal management

### API Endpoints Reference

See `postman_collection.json` in the project root for complete API documentation.

**Base URL**: Configured via `VITE_API_URL` environment variable (default: `http://localhost:3000`)

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Development Features

- Hot Module Replacement (HMR) for instant updates
- TypeScript type checking
- Tailwind CSS with JIT compilation
- Service Worker disabled in development (enabled in production)

## Building for Production

Build the application:

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:

- Minified JavaScript and CSS
- Tree-shaking to remove unused code
- Service worker for PWA functionality
- Optimized assets and caching

## Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
habit-tracker-app/
├── public/
│   ├── icons/               # PWA icons
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── icon.svg
│   └── apple-touch-icon.png # iOS home screen icon
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── habits/          # Habit management components
│   │   │   ├── HabitList.tsx
│   │   │   ├── HabitCard.tsx
│   │   │   ├── HabitForm.tsx
│   │   │   └── HabitDetail.tsx
│   │   ├── tracking/        # Tracking components
│   │   │   ├── TrackingCalendar.tsx
│   │   │   ├── StreakDisplay.tsx
│   │   │   └── TrackingHistory.tsx
│   │   ├── goals/           # Goal management components
│   │   │   ├── GoalForm.tsx
│   │   │   ├── GoalProgress.tsx
│   │   │   └── GoalList.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Layout.tsx
│   │   └── notifications/   # Notification settings
│   │       └── NotificationSettings.tsx
│   ├── store/              # Zustand state stores
│   │   ├── habitStore.ts
│   │   ├── trackingStore.ts
│   │   └── goalStore.ts
│   ├── services/           # API service layer
│   │   ├── api.ts
│   │   ├── habitService.ts
│   │   ├── trackingService.ts
│   │   └── goalService.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── habit.ts
│   │   ├── tracking.ts
│   │   └── goal.ts
│   ├── utils/              # Utility functions
│   │   └── notifications.ts
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles (Tailwind)
├── .env                    # Environment variables (local)
├── .env.example            # Environment variables template
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite and PWA configuration
└── README.md              # This file
```

## PWA Installation

### Desktop (Chrome, Edge, Brave)

1. Open the app in your browser
2. Look for the install icon in the address bar
3. Click "Install" to add to your applications

### Mobile (iOS Safari)

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

The app will appear on your home screen and run in standalone mode.

### Mobile (Android Chrome)

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Tap "Add" to confirm

## Features Guide

### Creating a Habit

1. Click the "Add Habit" button
2. Fill in the habit details:
   - **Name**: What you want to track (e.g., "Morning Exercise")
   - **Description**: More details (e.g., "30 min workout at the gym")
   - **Frequency**: daily, weekly, or custom
   - **Category**: health, productivity, mindfulness, etc.
   - **Color**: Visual identifier for the habit
3. Click "Create Habit"

### Tracking a Habit

1. Find the habit in your list
2. Click the "Track" button to log completion for today
3. View your streak and calendar to see progress

### Viewing Habit Details

1. Click the eye icon on a habit card
2. See your:
   - Current and longest streaks
   - Activity calendar for the month
   - Goals and progress

### Setting Goals

1. Open a habit's details
2. Click "Add Goal" under the Goals section
3. Set:
   - **Target Frequency**: Number of times (e.g., 5)
   - **Goal Type**: weekly, monthly, or yearly
4. Track your progress visually

### Enabling Notifications

1. Navigate to the "Reminders" tab
2. Click "Enable Notifications"
3. Grant permission when prompted
4. Test with "Send Test Notification"

**Note**: Some browsers and iOS have limited notification support. For best results, use Chrome or Edge on desktop.

## Development Notes

### Tailwind CSS v4 Setup

This project uses **Tailwind CSS v4** which has a different setup from v3:

- Uses `@tailwindcss/vite` plugin instead of PostCSS
- No `tailwind.config.js` file needed
- Import via `@import "tailwindcss"` in CSS

See [Tailwind CSS v4 documentation](https://tailwindcss.com/docs/installation/using-vite) for more details.

### State Management

Uses Zustand for lightweight, performant state management:

- No boilerplate like Redux
- Simple hooks-based API
- Automatic re-renders only for subscribed components
- Better performance than Context API for frequent updates

### API Error Handling

All API calls include error handling:

- Network errors show user-friendly messages
- Failed requests don't break the UI
- Loading states prevent duplicate requests

## Browser Support

- Chrome/Edge/Brave: Full support
- Firefox: Full support (notifications may vary)
- Safari Desktop: Full support
- Safari iOS: Partial PWA support (no push notifications)
- Samsung Internet: Full support

## Troubleshooting

### API Connection Issues

**Problem**: "Failed to fetch habits" or similar errors

**Solutions**:
1. Check that the API server is running
2. Verify `VITE_API_URL` in `.env` matches your API server
3. Check for CORS errors in browser console
4. Ensure API server has CORS configured for your frontend origin

### Environment Variables Not Loading

**Problem**: API calls going to wrong URL

**Solutions**:
1. Ensure `.env` file exists in project root
2. Check that variable starts with `VITE_` prefix
3. Restart dev server after changing `.env` file

### Service Worker Caching Stale Content

**Problem**: Old version of app showing after updates

**Solutions**:
1. Open DevTools → Application → Service Workers
2. Click "Unregister" for the service worker
3. Clear site data
4. Reload the page

In development, service worker is disabled to prevent this issue.

### Notifications Not Working

**Problem**: No notification permission prompt

**Solutions**:
1. Check browser supports notifications
2. Verify not in Private/Incognito mode
3. Check site permissions (not blocked)
4. iOS Safari: Notifications not supported
5. Try different browser (Chrome recommended)

### Build Errors

**Problem**: TypeScript or build errors

**Solutions**:
1. Run `npm install` to ensure dependencies are installed
2. Delete `node_modules` and run `npm install` again
3. Check Node.js version (v22+ recommended)
4. Run `npx tsc --noEmit` to see detailed TypeScript errors

## Performance Optimization

- **Code Splitting**: Vite automatically splits code for optimal loading
- **Tree Shaking**: Unused code removed in production builds
- **Asset Optimization**: Images and files optimized
- **Caching Strategy**: Service worker caches static assets
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React hooks used for expensive calculations

## Contributing

1. Follow existing code style and patterns
2. Use TypeScript for type safety
3. Write mobile-first responsive CSS
4. Test on multiple browsers and devices
5. Ensure accessibility (WCAG 2.1)

## License

This project is part of the Habit Tracker application suite.

## Support

For issues, questions, or feature requests, please refer to the project documentation or create an issue in the repository.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
