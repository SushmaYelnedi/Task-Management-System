# OrbiFlow - Task Management System Landing Page

A modern, clean, and aesthetic landing page for OrbiFlow, a task management web application designed for first-time users. Built with React + Vite and featuring a responsive design with smooth animations and modern UI patterns.

## ✨ Features

### 🎨 Modern Design System
- **Soft Pastel Color Palette**: Carefully chosen blues, purples, and neutral tones
- **Clean Typography**: Inter font family for excellent readability
- **Subtle Shadows & Gradients**: Depth and visual hierarchy
- **Smooth Animations**: Fade-in effects and hover transitions
- **Responsive Design**: Mobile-first approach with breakpoints

### 📱 Landing Page Sections

#### 🔝 Header/Navigation
- Fixed header with backdrop blur effect
- OrbiFlow logo with gradient text
- Navigation links (Features, Pricing, About, Contact)
- Prominent Login and Sign Up buttons
- Mobile-responsive with collapsible navigation

#### 🚀 Hero Section
- Compelling headline: "Organize your tasks, boost your productivity"
- Clear value proposition and subheading
- Dual call-to-action buttons (Get Started Free, Watch Demo)
- Interactive task board illustration
- Gradient background with soft pastels

#### ⚡ Features Section
- 5 key features with emoji icons:
  - 📋 Smart Task Organization
  - 👥 Team Collaboration
  - 📊 Progress Analytics
  - 🔔 Smart Notifications
  - 🎯 Goal Tracking
- Hover effects with card lifting animations
- Grid layout that adapts to screen size

#### 💬 Social Proof/Testimonials
- 3 customer testimonials with ratings
- Professional avatars and role descriptions
- Trusted company logos section
- Card-based layout with hover effects

#### 🎯 Call-to-Action Section
- Secondary CTA to drive conversions
- Trust indicators (no credit card, free trial, cancel anytime)
- Gradient background for emphasis

#### 🔗 Footer
- Organized link sections (Product, Support, Company, Connect)
- Social media placeholder links
- Copyright and brand information
- Clean, minimal design

## 🛠️ Tech Stack

- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.1.5
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Font**: Inter from Google Fonts
- **Icons**: Emoji-based for universal compatibility

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd OrbiFlow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

## 📁 Project Structure

```
OrbiFlow/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx          # Main landing page components
│   ├── App.css          # Landing page styles
│   ├── index.css        # Global styles and reset
│   └── main.jsx         # React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #d946ef)
- **Background**: Soft grays (#f9fafb, #f3f4f6)
- **Text**: Dark grays (#1f2937, #374151)
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #ef4444

### Typography
- **Font Family**: Inter
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Scale**: Modular scale with responsive sizing

### Spacing
- **Container**: Max-width 1200px with 1.5rem padding
- **Sections**: 6rem vertical padding
- **Components**: 1rem to 4rem gaps using CSS Grid/Flexbox

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🎯 Key Features Implemented

### ✅ User Experience
- **Smooth Scroll**: Implemented for navigation links
- **Loading Animations**: Staggered fade-in effects
- **Hover States**: Interactive feedback on all clickable elements
- **Focus Management**: Accessible focus indicators
- **Performance**: Optimized with Vite for fast loading

### ✅ Accessibility
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Focus Indicators**: Clear focus styles for keyboard navigation
- **Color Contrast**: WCAG compliant color combinations
- **Screen Reader**: Semantic structure and alt text

### ✅ SEO Ready
- **Meta Tags**: Ready for social media sharing
- **Semantic Structure**: Proper HTML5 semantics
- **Fast Loading**: Optimized assets and code splitting

## 🎨 Customization

### Changing Colors
Update CSS custom properties in `src/App.css`:

```css
:root {
  --primary-500: #your-color;
  --secondary-500: #your-color;
  /* ... other variables */
}
```

### Adding Sections
Add new components in `src/App.jsx` and corresponding styles in `src/App.css`.

### Modifying Content
Update text content, testimonials, and feature descriptions directly in the component definitions.

## 🔮 Future Enhancements

- **Animations**: GSAP integration for advanced animations
- **CMS Integration**: Headless CMS for content management
- **A/B Testing**: Multiple hero variations
- **Analytics**: Google Analytics and conversion tracking
- **Internationalization**: Multi-language support
- **Dark Mode**: Theme switching capability

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for modern web experiences**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
