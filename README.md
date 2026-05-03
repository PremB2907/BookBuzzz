# 📚 BookBuzz  
### A Student-to-Student Second-Hand Book Exchange Platform

BookBuzz is a peer-to-peer web platform designed to help students buy and sell second-hand academic books **directly with each other**, eliminating vendors, commissions, and inflated prices.

The core idea is simple:  
**students help students save money.**

---

## 🚩 Problem Statement

- Academic books are expensive and often used for only one semester.
- Existing marketplaces rely on vendors or third parties, increasing prices.
- Students lack a trusted, college-centric platform to exchange books directly.
- Informal WhatsApp groups are unstructured, unreliable, and unscalable.

---

## 💡 Solution

BookBuzz creates a **direct student-to-student marketplace** where:
- Sellers list books they no longer need.
- Buyers connect directly with sellers.
- No middlemen, no commissions, no hidden costs.

The platform focuses on:
- **Lower price points**
- **College-level trust**
- **Simple and fast interactions**

---

## 🎯 Key Focus Areas

- 💸 **Affordability first** – prices set by students, not vendors  
- 🎓 **Student-only ecosystem** – designed for college communities  
- 🌱 **Sustainability** – reuse books, reduce waste  
- 🎨 **Bold UI direction** – orange theme with modern, clean design  

---

## 🛠 Tech Stack

### Frontend
- HTML5
- CSS3 (Custom properties, Flexbox, Grid)
- JavaScript (ES6+ with modular functions)
- Font Awesome Icons

### Backend (Planned)
- PHP
- MySQL
- XAMPP (Apache + MySQL)

### Development Environment
- VS Code
- XAMPP Server
- Git & GitHub

---

## ✨ Features

### Current Features ✅
- **Modern UI/UX** - Orange theme with clean, responsive design
- **Dark Mode** - Toggle between light and dark themes (saved to localStorage)
- **Modal-based Authentication** - Login/Register with OTP verification
- **Book Search** - Real-time search by title or author
- **Advanced Filters** - Filter by subject, condition, and price range
- **Book Grid** - Visual book listings with cover images
- **Comprehensive Sell Form** - All book details including edition, condition, images
- **Image Upload Preview** - Preview book photos before uploading
- **Toast Notifications** - Non-blocking success/error messages
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Form Validation** - Email, mobile, and required field validation

### Planned Features 🚧
- Full backend integration using PHP & MySQL
- User dashboard (My Listings, My Purchases)
- Dynamic book listings from database
- Real OTP via SMS/Email API
- College email verification
- In-app chat between buyer & seller
- Wishlist and saved searches
- Admin moderation panel

---

## 🎨 UI / Design Philosophy

BookBuzz features a modern, student-friendly design:
- **Orange/Yellow color scheme** - Energetic and youthful
- **Clean layouts** - Easy to navigate and use
- **Card-based design** - Modern book presentation
- **Modal interactions** - No page reloads for auth
- **Fully responsive** - Works on all screen sizes

---

## 🧪 How to Run Locally

### Option 1: Open Directly
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start browsing, buying, or selling!

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

### Backend Setup (Future)
1. Install XAMPP
2. Start Apache & MySQL
3. Place project folder inside `htdocs`
4. Configure database connection

---

## 📱 Pages Overview

| Page | Description |
|------|-------------|
| `index.html` | Landing page with hero section and feature cards |
| `buy.html` | Browse books with search, filters, and contact seller |
| `sell.html` | Comprehensive form to list books for sale |

---

## 🔐 Authentication Flow

1. Click **Login** in the navigation
2. Existing users: Enter email and password
3. New users: Click "Register here" and fill details
4. OTP will be shown in alert (simulated SMS)
5. Enter OTP to complete registration
6. Start buying/selling!

---

## 🔮 Future Scope

- Campus-wide deployment
- College email verification
- In-app chat between buyer & seller
- Analytics for demand trends
- Mobile app (React Native/Flutter)
- Expansion to notes & study material exchange

---

## 👨‍💻 Author

**Prem B.**
Engineering Student | Builder | Curious Mind
GitHub: [https://github.com/PremB2907](https://github.com/PremB2907)

---

## 📜 License

This project is for educational and experimental purposes.

