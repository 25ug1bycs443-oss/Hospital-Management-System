const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'hms_secret_session_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static frontend assets from public directory
app.use(express.static('public'));

// Mock Login API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.user = { username: 'admin' };
    res.json({ success: true, message: 'Logged in successfully' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
});

// Logout API
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Session status API
app.get('/api/auth/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Mount modular API routes
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/wards', require('./routes/wardRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke in the server: ' + err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`HMS Server running successfully at http://localhost:${PORT}`);
});
