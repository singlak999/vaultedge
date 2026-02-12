# VaultEdge — Finance Dashboard

![VaultEdge](https://img.shields.io/badge/Status-Active-success?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**VaultEdge** is a professional, full-stack finance web application designed for tracking personal wealth, investments, and expenses. It features a modern glassmorphism UI, real-time animated charts, and secure user authentication.

---

## 🚀 Features

- **Premium UI**: Dark-themed dashboard with glass-blur effects, smooth animations, and responsive design.
- **Secure Auth**: Session-based authentication with bcrypt password hashing.
- **Real-Time Charts**: Interactive canvas-drawn portfolio performance and asset allocation charts.
- **Transaction Feed**: Detailed transaction history with category icons and status indicators.
- **Landing Page**: Fully responsive public landing page with contact form and testimonials.
- **Data Persistence**: Lightweight CSV-based storage for users and contact form submissions.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Custom Properties), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Auth**: `express-session`, `bcryptjs`
- **Data**: `csv-parser`
- **Design**: Google Fonts (Inter, Outfit), CSS Grid/Flexbox

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/singlak999/vaultedge.git
   cd vaultedge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Seed database** (creates initial user accounts)
   ```bash
   node seed-users.js
   ```

4. **Start the server**
   ```bash
   node server.js
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Default Credentials

Use these accounts to log in and test the dashboard:

| Username   | Password   | Role      |
|------------|------------|-----------|
| `test`     | `test`     | Premium   |
| `krishna`  | `welcome1` | Premium   |
| `jane`     | `finance2` | Standard  |

---

## 📂 Project Structure

```
├── data/               # CSV data storage (users.csv, contacts.csv)
├── views/              # Public pages (landing.html, login.html)
├── index.html          # Protected Dashboard (template)
├── index.css           # Dashboard styles
├── app.js              # Dashboard logic & charts
├── server.js           # Express server entry point
├── seed-users.js       # User generation script
└── package.json        # Project dependencies
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
