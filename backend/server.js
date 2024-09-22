const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 60 } // 1 hour session
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/admin-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error(err));

// Admin Schema
const AdminSchema = new mongoose.Schema({
    username: String,
    password: String
});
const Admin = mongoose.model('Admin', AdminSchema);

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    req.session.admin = admin;
    res.json({ message: 'Login successful', admin });
});

// Check session
app.get('/session', (req, res) => {
    if (req.session.admin) {
        res.json({ admin: req.session.admin });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Logout failed' });
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logged out' });
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
