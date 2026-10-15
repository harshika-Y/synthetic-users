<div align="center">

# 🍽️ Modern Restaurant & Café Web Application Template
### *A High-Converting, Production-Ready Restaurant Website with 3D Flipbook Menu & Scroll-Linked Motion*

[![GitHub Stars](https://img.shields.io/github/stars/santoshjena6/kadappa-cafe?style=for-the-badge&logo=github&color=ffb400&logoColor=white)](https://github.com/santoshjena6/kadappa-cafe/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/santoshjena6/kadappa-cafe?style=for-the-badge&logo=github&color=11421b&logoColor=white)](https://github.com/santoshjena6/kadappa-cafe/network/members)
[![Follow @santoshjena6](https://img.shields.io/github/followers/santoshjena6?label=Follow%20%40santoshjena6&style=for-the-badge&logo=github&color=ffb400&logoColor=white)](https://github.com/santoshjena6)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<br />

<p align="center">
  <b>Built for restaurants, cafés, bistros, cloud kitchens, and fine dining establishments.</b><br />
  Easily customize branding, menu items, colors, and reservation forms in under 10 minutes.
</p>

[✨ Key Features](#-key-features) •
[🚀 Quick Start](#-quick-start) •
[🎨 Customization Guide](#-customization-guide-adapt-for-any-restaurant) •
[📂 Project Structure](#-project-structure) •
[🗺️ Roadmap](#️-upcoming-features--roadmap) •
[⭐ Support](#-show-your-support--follow-for-upcoming-projects)

---

</div>

> [!IMPORTANT]
> ### 🌟 Support The Developer & Stay Tuned For Upcoming Projects!
> If you are using this code for your restaurant, client projects, or learning:
> 1. ⭐ **Star this repository** to help other developers and restaurant owners discover it.
> 2. 👤 **Follow [@santoshjena6](https://github.com/santoshjena6) on GitHub** to get notified about upcoming open-source releases:
>    - 🛒 **Full-Stack Restaurant POS & Online Ordering System** (Cart + Payment Gateway)
>    - 📱 **Mobile-First Food Ordering App UI**
>    - ☁️ **AWS Serverless Table Booking Backend** (AWS Lambda, DynamoDB & SES Email Confirmations)
>
> 👉 **[Click here to follow @santoshjena6 on GitHub](https://github.com/santoshjena6)** 👈

---

## 📸 Overview

This repository provides an **ultra-modern, highly aesthetic web application** for modern dining businesses. While configured out of the box with the **Kadappa Café** South Indian theme, **the codebase is 100% modular and generic** — built so any developer can rebrand it for Italian trattorias, Mexican taquerias, specialty coffee bars, bakeries, or sushi lounges with minimal effort.

---

## ✨ Key Features

- 📖 **Interactive 3D Virtual Flipbook Menu**: Real turn-page physics powered by `react-pageflip`. Customers can realistically flip through high-resolution digital menu pages with smooth page curl animations.
- 🎬 **Scroll-Linked Food Motion Physics**: Signature dish hero animation powered by `framer-motion` that tracks scroll progress smoothly across sections.
- 📅 **Split-Screen Table Reservation System**: Clean booking flow featuring guest selector, date & time pickers, and interactive confirmation state.
- 🎥 **Video Reels Showcase ("Watch Us")**: Showcase food preparation, kitchen behind-the-scenes, and customer dining vibes.
- 💎 **Curated Luxury Aesthetic**: Dark earthy greens, warm turmeric gold, glassmorphic blur cards, and editorial typography (`Antonio`, `Playfair Display`, `Inter`).
- ⚡ **Lightning Fast Performance**: Built on React 19 and Vite 8 with an optimized bundle size that builds in under **750ms**.
- 🔍 **Clean Code Architecture**: Modular components, separated layouts, and clean route management with React Router v7.

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Animation & Transitions**: [Framer Motion v14](https://www.framer.com/motion/)
- **Book Flip Effect**: [react-pageflip](https://github.com/Nodlik/react-pageflip)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Styling**: Vanilla CSS + CSS Design Tokens (`global.css`)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18+ recommended)
- npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/santoshjena6/kadappa-cafe.git
cd kadappa-cafe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Launch local development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Create production build
```bash
npm run build
```
The optimized production files will be output into the `dist/` directory, ready to deploy to **AWS (S3 + CloudFront)**, **Vercel**, **Netlify**, or any static hosting platform.

---

## 🎨 Customization Guide (Adapt for Any Restaurant)

You can transform this template for any restaurant brand in 5 simple steps:

### 1. Update Theme Colors & Fonts
Open `src/styles/global.css` and update the CSS variables in `:root`:

```css
:root {
  /* Brand Colors - change these to your restaurant's palette */
  --color-tiger-gold: #ffb400;     /* Primary accent / button color */
  --color-ember-rust: #11421b;     /* Main background color */
  --color-dark-spice: #0a2911;     /* Card surface color */
  --color-charred-clove: #051408;  /* Deep dark contrast */
  
  /* Fonts */
  --font-salmond: 'Antonio', sans-serif;
  --font-graphikx: 'Inter', sans-serif;
}
```

### 2. Replace Restaurant Logo & Brand Assets
Place your assets in the `/public` directory:
- `/public/logo.png`: Replace with your restaurant's logo.
- `/public/favicon.svg`: Replace with your site favicon.
- `/public/dosa.png`: Replace with your signature dish transparent PNG for the scroll animation.

### 3. Upload Your Own Flipbook Menu Pages
Inside `/public/Menu/`, replace the menu images with your restaurant's menu pages:
```
public/Menu/
├── 1.png   (Cover page)
├── 2.png   (Starters / Appetizers)
├── 3.png   (Main Course)
├── 4.png   (Desserts & Beverages)
└── 5.png   (Back Cover / Special Combos)
```
*Tip: High-resolution portrait PNGs (aspect ratio roughly 3:4) look best in the flipbook!*

### 4. Edit Restaurant Details & Address
- **Contact & Location**: Update your address, phone, and email in `src/pages/Contact.jsx` and `src/components/Footer.jsx`.
- **Operating Hours**: Update operating hours in `src/components/Footer.jsx`.
- **About Story**: Personalize your chef's story and restaurant mission in `src/pages/About.jsx`.

### 5. Hook Up Table Reservations to Your Backend
In `src/pages/BookTable.jsx`, locate `handleSubmit`:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  // Call your API endpoint, AWS Lambda function, or EmailJS service here:
  // await fetch('/api/reservations', { method: 'POST', body: JSON.stringify(formData) });
  setIsSubmitted(true);
};
```

---

## 📂 Project Structure

```text
kadappa-cafe/
├── public/
│   ├── Menu/                  # Flipbook menu page scans (1.png - 5.png)
│   ├── logo.png               # Restaurant brand logo
│   ├── dosa.png               # Hero interactive scroll item
│   ├── filtercoffe.png        # Must-try item card image
│   ├── thali.png              # Must-try item card image
│   └── kathakali.png          # Reservation page art
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Header navigation bar
│   │   └── Footer.jsx         # Footer with contact, newsletter & hours
│   ├── layouts/
│   │   └── MainLayout.jsx     # Master layout wrapper with <Outlet />
│   ├── pages/
│   │   ├── Home.jsx           # Hero, scroll physics, video reel & dishes
│   │   ├── Menu.jsx           # 3D interactive virtual flipbook menu
│   │   ├── BookTable.jsx      # Reservation booking system
│   │   ├── About.jsx          # Brand story, stats & core values
│   │   └── Contact.jsx        # Location info & contact form
│   ├── routes/
│   │   └── AppRoutes.jsx      # React Router route definitions
│   ├── styles/
│   │   └── global.css         # CSS variables, glassmorphism & typography
│   ├── App.jsx                # Main application component
│   └── main.jsx               # React DOM root entry
├── index.html                 # HTML template
├── package.json               # Dependencies & scripts
└── vite.config.js             # Vite configuration
```

---

## 🗺️ Upcoming Features & Roadmap

We are actively working on expanding this project into a full restaurant ecosystem:

- [ ] 📱 **Mobile Drawer Navigation**: Animated hamburger menu drawer for compact devices.
- [ ] 🛒 **Online Order & Cart System**: Floating cart drawer with item counter.
- [ ] 💳 **Payment Gateway Integration**: Razorpay & Stripe checkout support.
- [ ] ☁️ **AWS Serverless Booking Backend**: Automated SMS & Email reservation confirmations via AWS SES & SNS.
- [ ] 🌓 **Multi-Theme Switcher**: Switch between Indian, Italian, Cafe/Bakery, and Japanese dark/light presets.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/santoshjena6/kadappa-cafe/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⭐ Show Your Support & Follow For Upcoming Projects

If this project saved you time or helped you build something awesome:

- ⭐️ **Give this project a Star on GitHub!**
- 👤 **Follow [@santoshjena6](https://github.com/santoshjena6)** on GitHub to get instant updates on upcoming open-source restaurant templates, UI libraries, and full-stack solutions!
- 💬 **Share feedback** or tag us on your restaurant's live site!

---

## 👨‍💻 Author

**Santosh Jena**
- GitHub: [@santoshjena6](https://github.com/santoshjena6)
- Email: santoshjena7991@gmail.com

---

## 📄 License

This project is licensed under the **MIT License** - you are free to use it for personal, commercial, and client restaurant projects!
