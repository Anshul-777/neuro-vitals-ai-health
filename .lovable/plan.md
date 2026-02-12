

# Neuro-VX Platform Enhancement Plan

This is a large-scale update covering new pages, backend infrastructure, UI improvements, chatbot integration, and production features. Here is the breakdown organized by area.

---

## 1. Individual Test Selection and Per-Test Results

**Current state:** Test selection page shows all 4 modules with checkboxes, results page shows all metrics.

**Changes:**
- Update `TestSelectionPage.tsx` to show each test as a standalone card with a "Learn More" button that opens a detailed modal/expandable section explaining the test professionally (what it measures, how it works, clinical relevance, duration, requirements)
- When only 1 test is selected for "Individual Test", the Results page will only render sections for that specific test (hide unrelated modules)
- Add a "Learn More" detailed description for each of the 4 modules: Face Scan (rPPG cardio-respiratory), Body Scan (gait neuro-motor), Voice Scan (audio biomarkers), 3D Face Scan (structural analysis)

## 2. Pre-Test Notice and Instructions

**Changes:**
- Create a new intermediate step before camera opens on `AnalysisPage.tsx` showing a notice screen with module-specific preparation instructions (lighting, positioning, noise, etc.)
- Each test gets tailored instructions (e.g., Face Scan: bright lighting, neutral expression; Voice Scan: quiet room; Body Scan: full body visible, stand back)
- Add a "Ready & Begin" button that the user must click before the camera/mic activates
- For Full System Analysis, show a combined notice explaining all 4 tests will run sequentially

## 3. Camera/Mic Permission Frontend

**Changes:**
- Add a custom permission request UI overlay on `AnalysisPage.tsx` that appears before `getUserMedia` is called
- Show which permissions are needed (camera for face/body/3D, microphone for voice) with explanations
- Handle denied permissions gracefully with instructions to re-enable

## 4. Results Download

**Changes:**
- Add a "Download Report" button on `ResultsPage.tsx` that generates a formatted text/JSON summary of the analysis results
- Use browser-native download (create a Blob and trigger download)

## 5. Supabase SQL Queries File

**Changes:**
- Create a `supabase/schema.sql` file containing all table definitions for:
  - `users` (id, full_name, email, phone, dob, created_at)
  - `test_sessions` (id, user_id, type, modules, started_at, completed_at)
  - `test_results` (id, session_id, rppg_data, gait_data, voice_data, face_data, risk_data, timestamp)
  - `feedback` (id, user_id, rating, message, created_at)
  - `contact_messages` (id, name, email, subject, message, created_at)
  - `help_questions` (id, question, answer, category, order)
- Include RLS policies for each table
- This is a standalone SQL file for external Supabase - no Lovable-specific dependencies

## 6. Chatbot with Gemini API Placeholder

**Changes:**
- Create a floating chatbot circle button (bottom-right corner) visible on all authenticated pages
- Chatbot window: aesthetic slide-up panel with message bubbles, input field, and send button
- Add placeholder API connection structure for Gemini (configurable API key via environment variable)
- Currently uses the existing local AI response logic as fallback; ready for real API integration
- Add the chatbot as a component rendered in `App.tsx` for authenticated routes

## 7. About Page

**Changes:**
- Create `src/pages/AboutPage.tsx` with 1000+ words of detailed platform information covering:
  - Platform overview and mission
  - Technology and methodology (rPPG, MediaPipe, librosa, risk stratification)
  - Privacy and security architecture
  - Team vision and research basis
  - Medical disclaimers and intended use
  - Future roadmap
- Add route `/about` in `App.tsx`

## 8. Help & Contact Page

**Changes:**
- Create `src/pages/HelpContactPage.tsx` with:
  - FAQ accordion section with common questions and answers
  - Contact form (name, email, subject, message) - stores to Supabase `contact_messages` table
  - Rating component (1-5 stars) for platform feedback
  - Feedback form with text area - stores to Supabase `feedback` table
  - Email API connection placeholder (mailto link to anshulrathod999@gmail.com as fallback)
- SQL queries for these tables included in the schema file
- Add route `/help` in `App.tsx`

## 9. Account Page Improvements

**Changes:**
- Increase Account page width from `max-w-3xl` to `max-w-5xl` with full-width cards
- Make all values dynamic (pull from localStorage, calculate age from DOB in real-time)
- Remove any hardcoded placeholder values
- Make test count pull from actual history length (no fallback to demo count)

## 10. Footer Navigation

**Changes:**
- Add a consistent footer component to all authenticated pages (Dashboard, Account, Settings, Results, etc.)
- Include: Email (anshulrathod999@gmail.com), GitHub link (Anshul-777), copyright "2026 All Rights Reserved"
- Clean, minimal design matching the platform aesthetic

## 11. Disclaimer Banner - Show Once Only

**Changes:**
- Update `DashboardPage.tsx` to check `sessionStorage` for `nvx_disclaimer_shown`
- Only display the medical disclaimer banner on first visit after login/registration
- Once dismissed or shown, set the flag so it doesn't repeat when navigating between pages

## 12. Node.js Server File

**Changes:**
- Create `server.js` at project root as an Express.js gateway skeleton
- Endpoints for: `/api/auth/login`, `/api/auth/register`, `/api/analysis/start`, `/api/results`, `/api/contact`, `/api/feedback`, `/api/chat`
- Placeholder middleware for biometric verification
- CORS configuration and basic error handling
- This is a reference file - not executed by Lovable but provides the backend structure

## 13. Dashboard Hero Section Enhancement

**Changes:**
- Increase hero section height and add more visual elements
- Better gradient overlays and animated health metric indicators
- More prominent welcome message with health summary stats

## 14. Header Navigation

**Changes:**
- Add navigation links to the Dashboard header: Home, About, Help, Account
- Use the existing `NavLink.tsx` component or inline navigation
- Keep the wifi icon and add theme toggle button beside it

## 15. Theme Toggle on Dashboard

**Changes:**
- Add Sun/Moon toggle button next to the Wifi icon in the Dashboard header
- Uses the same theme logic as Account page (persists to localStorage)

## 16. Animations and Transitions

**Changes:**
- Add page transition animations using framer-motion throughout
- Scroll-triggered animations (fade-up, slide-from-side) for cards and sections
- Smooth scroll behavior via CSS `scroll-behavior: smooth`
- Add varied animation variants (slide-left, slide-right, scale-in) for different card types

## 17. Camera Frame Design

**Changes:**
- Improve the Analysis page camera frame with rounded corners, gradient borders, animated corner brackets, and a pulsing scan line
- Add a frosted glass info panel overlay

## 18. Settings - Fully Functional

**Changes:**
- Make Export Data actually download a JSON file of all user data
- Make Clear History functional with confirmation
- Make Change Password work (validate old password, apply new)
- Make Biometric Settings show current enrollment method and allow re-enrollment
- Language selector (UI only, English default)
- All toggles persist to localStorage

## 19. Additional Production Features

- Add loading states/skeletons during page transitions
- Add error boundaries for graceful failure
- Add `NavLink.tsx` usage for active route highlighting
- Responsive design verification across all new pages

---

## Technical Details

### New Files
- `src/pages/AboutPage.tsx`
- `src/pages/HelpContactPage.tsx`
- `src/components/Chatbot.tsx`
- `src/components/Footer.tsx`
- `server.js`
- `supabase/schema.sql`

### Modified Files
- `src/App.tsx` - Add new routes, render Chatbot and Footer
- `src/pages/DashboardPage.tsx` - Hero enhancement, header nav, theme toggle, disclaimer once-only, footer
- `src/pages/TestSelectionPage.tsx` - Learn More modals, individual test flow
- `src/pages/AnalysisPage.tsx` - Pre-test notice, permission UI, camera design
- `src/pages/ResultsPage.tsx` - Conditional module display, download button
- `src/pages/AccountPage.tsx` - Wider layout, dynamic values, full-width cards
- `src/pages/SettingsPage.tsx` - Fully functional settings items
- `src/index.css` - Additional animation keyframes

### Dependencies
No new npm packages required. All features use existing dependencies (framer-motion, lucide-react, recharts, react-router-dom).

