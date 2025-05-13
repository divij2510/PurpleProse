
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const sequelize = require('./config/database');

// Debug environment load
console.log('Current directory:', __dirname);
console.log('Server env GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Server env GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

// Import routes after env loaded
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true, // if using cookies or auth headers
}));
app.use(passport.initialize());

// Sync DB
sequelize.sync().then(() => console.log('DB connected'));

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
// Health check route
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
