/**
 * Neuro-Vitals Express.js Backend Server
 * Reference file — provides the backend API structure for external deployment.
 * This file is NOT executed by Lovable but serves as the server blueprint.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, dob, password } = req.body;
    // TODO: Hash password, create user in Supabase, return JWT
    res.json({ success: true, message: 'User registered', user: { fullName, email } });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // TODO: Verify credentials against Supabase, return JWT
    res.json({ success: true, message: 'Login successful', token: 'placeholder_jwt' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Biometric verification middleware placeholder
const verifyBiometric = (req, res, next) => {
  const biometricToken = req.headers['x-biometric-token'];
  if (!biometricToken) {
    return res.status(401).json({ error: 'Biometric verification required' });
  }
  // TODO: Verify biometric token
  next();
};

// ============================================
// ANALYSIS ROUTES
// ============================================
app.post('/api/analysis/start', async (req, res) => {
  try {
    const { userId, type, modules } = req.body;
    // TODO: Create test_session in Supabase
    res.json({ success: true, sessionId: 'placeholder_session_id', modules });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start analysis' });
  }
});

app.post('/api/results', async (req, res) => {
  try {
    const { sessionId, rppgData, gaitData, voiceData, faceData, riskData } = req.body;
    // TODO: Store test_results in Supabase
    res.json({ success: true, message: 'Results stored' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store results' });
  }
});

app.get('/api/results/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // TODO: Fetch user's test results from Supabase
    res.json({ success: true, results: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// ============================================
// CONTACT & FEEDBACK ROUTES
// ============================================
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    // TODO: Insert into contact_messages table in Supabase
    // TODO: Send email notification via SendGrid/Nodemailer
    res.json({ success: true, message: 'Contact message received' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { userId, rating, message } = req.body;
    // TODO: Insert into feedback table in Supabase
    res.json({ success: true, message: 'Feedback received' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ============================================
// CHAT ROUTE (Gemini API Placeholder)
// ============================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (GEMINI_API_KEY) {
      // TODO: Call Gemini API
      // const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      //   body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
      // });
      res.json({ success: true, reply: 'Gemini response placeholder' });
    } else {
      res.json({ success: true, reply: 'AI features require GEMINI_API_KEY configuration.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Neuro-Vitals server running on port ${PORT}`);
});
