/* ============================================================
   server.js — VaultEdge Express Server
   ============================================================ */

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'vaultedge-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
}));

// Serve static files (CSS, JS, images) from project root
app.use('/static', express.static(path.join(__dirname)));
app.use('/views', express.static(path.join(__dirname, 'views')));

// ── Helpers ────────────────────────────────────────────────
function readUsersCSV() {
    return new Promise((resolve, reject) => {
        const users = [];
        const filePath = path.join(__dirname, 'data', 'users.csv');
        if (!fs.existsSync(filePath)) return resolve([]);
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => users.push(row))
            .on('end', () => resolve(users))
            .on('error', reject);
    });
}

function appendContactCSV(data) {
    const filePath = path.join(__dirname, 'data', 'contacts.csv');
    // Escape commas/newlines in values
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const row = `${escape(data.timestamp)},${escape(data.name)},${escape(data.email)},${escape(data.subject)},${escape(data.message)}\n`;
    fs.appendFileSync(filePath, row, 'utf-8');
}

// Auth guard middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    res.redirect('/login');
}

// Simple template injection helper
function renderHTML(filePath, replacements = {}) {
    let html = fs.readFileSync(filePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return html;
}

// ── Routes ─────────────────────────────────────────────────

// Landing page (public)
app.get('/', (req, res) => {
    const html = renderHTML(path.join(__dirname, 'views', 'landing.html'), {});
    res.send(html);
});

// Login page
app.get('/login', (req, res) => {
    if (req.session && req.session.user) return res.redirect('/dashboard');
    const html = renderHTML(path.join(__dirname, 'views', 'login.html'), { error: '' });
    res.send(html);
});

// Login POST
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await readUsersCSV();
        const user = users.find(u => u.username === username);
        if (!user) {
            const html = renderHTML(path.join(__dirname, 'views', 'login.html'), {
                error: '<div class="form-error">Invalid username or password</div>'
            });
            return res.send(html);
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            const html = renderHTML(path.join(__dirname, 'views', 'login.html'), {
                error: '<div class="form-error">Invalid username or password</div>'
            });
            return res.send(html);
        }

        // Set session
        req.session.user = {
            username: user.username,
            display_name: user.display_name,
            role: user.role
        };

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Dashboard (protected)
app.get('/dashboard', requireAuth, (req, res) => {
    const user = req.session.user;
    const initials = user.display_name.split(' ').map(w => w[0]).join('').toUpperCase();
    const html = renderHTML(path.join(__dirname, 'index.html'), {
        USER_NAME: user.display_name,
        USER_INITIALS: initials,
        USER_ROLE: user.role + ' Member',
        FIRST_NAME: user.display_name.split(' ')[0]
    });
    res.send(html);
});

// Contact form POST
app.post('/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        appendContactCSV({
            timestamp: new Date().toISOString(),
            name: name || '',
            email: email || '',
            subject: subject || '',
            message: message || ''
        });
        res.json({ success: true, message: 'Thank you! We will get back to you soon.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  🏦  VaultEdge running at  http://localhost:${PORT}\n`);
});
