# OptiBid Energy - Enterprise Marketing Website

> Revolutionary enterprise-grade energy trading platform with AI-powered optimization, real-time analytics, and visual knowledge graphs.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10-0055FF?style=flat-square&logo=framer)](https://www.framer.com/motion/)

## 🚀 Features

### ✨ **Dynamic Marketing Experience**
- **Energy Flow Animation**: Subtle particle animations representing energy flow
- **Responsive Design**: Mobile-first approach with accessibility compliance
- **Multi-language Support**: i18n support for global markets
- **PWA Ready**: Progressive Web App with offline capabilities

### 🎯 **Enterprise Solutions**
- **Energy Analyst**: Advanced analytics and forecasting tools
- **Energy Trader**: Intelligent bidding optimization and portfolio management
- **Energy Producer**: Production optimization and revenue maximization
- **Grid Operations**: Grid stability tools and real-time operational insights
- **Energy Storage**: Battery optimization and energy storage management

### 🧠 **Advanced Features**
- **Visual Knowledge Graphs**: Interactive node/edge graphs with clustering
- **AI-Powered Insights**: Machine learning algorithms for predictive analytics
- **Real-time Collaboration**: Live team collaboration with presence indicators

### 🔧 **Enterprise-Grade Infrastructure**
- **Theme System**: 4 color modes (Light, Dark, Auto, Blue)
- **Security Compliance**: GDPR, SOC2, ISO 27001 ready
- **Performance Optimized**: Lighthouse score >90
- **Accessibility**: WCAG 2.1 AA compliance

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation and interactions
- **React Hook Form** - Form validation and management
- **Zod** - Schema validation

### **Design System**
- **Headless UI** - Accessible components
- **Heroicons** - SVG icon library
- **Custom Theme System** - CSS variables with 4 modes
- **Responsive Grid** - Mobile-first breakpoints

### **PWA & Performance**
- **Service Worker** - Offline functionality and caching
- **Web App Manifest** - Installable web app
- **Image Optimization** - Next.js Image component
- **Bundle Optimization** - Code splitting and lazy loading

### **Analytics & Tracking**
- **Google Analytics 4** - Web analytics
- **Hotjar** - User behavior analytics
- **Custom Analytics** - Event tracking and conversion

## 🏗️ Project Structure

```
enterprise-marketing/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles with theme variables
├── components/                   # Reusable components
│   ├── layout/                  # Layout components
│   │   ├── Navigation.tsx       # Main navigation
│   │   └── Footer.tsx           # Site footer
│   ├── sections/                # Page sections
│   │   ├── HeroSection.tsx      # Hero section
│   │   ├── SolutionsSection.tsx # Solutions showcase
│   │   └── FeaturesSection.tsx  # Features highlight
│   ├── effects/                 # Visual effects
│   │   └── EnergyFlowBackground.tsx # Animated background
│   ├── ui/                      # UI components
│   │   └── CookieBanner.tsx     # GDPR compliance
│   └── providers/               # Context providers
│       ├── ThemeProvider.tsx    # Theme management
│       ├── I18nProvider.tsx     # Internationalization
│       └── Analytics.tsx        # Analytics tracking
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   ├── offline.html             # Offline fallback
│   └── icons/                   # App icons
└── lib/                         # Utility libraries
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/optibid-energy-marketing.git
   cd optibid-energy-marketing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Analytics
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_HOTJAR_ID=XXXXXXX
   
   # API Endpoints
   NEXT_PUBLIC_API_URL=https://api.optibid-energy.com
   NEXT_PUBLIC_DEMO_URL=https://demo.optibid-energy.com
   
   # Social Media
   NEXT_PUBLIC_TWITTER_HANDLE=@optibid_energy
   NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/optibid-energy
   
   # Feature Flags
   NEXT_PUBLIC_ENABLE_DEMO=true
   NEXT_PUBLIC_ENABLE_NEWSLETTER=true
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## 🎨 Design System

### Theme Variables
The design system uses CSS custom properties for theme consistency:

```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --color-accent: #f59e0b;
  --color-text-primary: #0f172a;
  /* ... more variables */
}
```

### Theme Modes
- **Light Mode**: Clean, professional light theme
- **Dark Mode**: Modern dark theme with optimized contrast
- **Auto Mode**: System preference detection
- **Blue Mode**: Brand-focused blue theme

### Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion preferences
- High contrast mode support

## 📊 Analytics & Tracking

### Event Tracking
```typescript
import { trackEvent, trackInteraction } from '@/components/providers/Analytics'

// Track page views automatically
// Custom events
trackEvent('conversion', {
  type: 'signup',
  source: 'hero_cta',
})

// User interactions
trackInteraction('navigation', 'click_solutions')
```

### Analytics Integration
- **Google Analytics 4**: Page views, events, conversions
- **Hotjar**: User recordings, heatmaps
- **Custom Analytics**: Internal event tracking

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking

# PWA
npm run build:pwa        # Build with PWA optimizations
```

### Code Style
- **ESLint**: Code linting and formatting
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking
- **Tailwind CSS**: Utility-first styling

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow accessibility best practices
- Use semantic HTML elements
- Optimize for performance

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t optibid-marketing .
docker run -p 3000:3000 optibid-marketing
```

### Environment Configuration
- Set up environment variables in your deployment platform
- Configure custom domain and SSL certificates
- Set up analytics tracking IDs
- Configure build optimization settings

## 📱 PWA Features

### Offline Support
- Service worker for offline functionality
- Cached static assets and API responses
- Offline fallback pages
- Background synchronization

### Installation
- Add to home screen functionality
- App shortcuts for key features
- Native app-like experience
- Cross-platform compatibility

## 🌐 Internationalization

### Supported Languages
- **English** (en) - Primary language
- **Hindi** (hi) - Indian market
- **Spanish** (es) - Latin America
- **French** (fr) - European market

### Adding New Languages
1. Add translation keys to `I18nProvider.tsx`
2. Update language selector in navigation
3. Add language-specific meta tags
4. Test RTL layout if applicable

## 🔒 Security & Compliance

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### Privacy Compliance
- GDPR compliant cookie consent
- Data processing transparency
- User rights management
- Privacy-by-design principles

## 🎯 Performance

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Optimization Techniques
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Bundle size optimization
- Service worker caching
- Critical CSS inlining

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use semantic commit messages
- Write accessible HTML
- Test across different browsers
- Maintain responsive design

## 📄 License

This project is proprietary software owned by OptiBid Energy. All rights reserved.

## 🆘 Support

- **Documentation**: [docs.optibid-energy.com](https://docs.optibid-energy.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/optibid-energy-marketing/issues)
- **Email**: support@optibid-energy.com
- **Status**: [status.optibid-energy.com](https://status.optibid-energy.com)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Marketing website with dynamic animations
- ✅ PWA functionality
- ✅ Multi-language support
- ✅ Enterprise theme system

### Phase 2 (Next)
- 📝 Advanced analytics integration
- 📝 A/B testing framework
- 📝 Advanced SEO optimization
- 📝 Performance monitoring

### Phase 3 (Future)
- 📝 Machine learning personalization
- 📝 Advanced collaboration features
- 📝 Real-time chat integration
- 📝 Advanced admin dashboard

---

**Built with ❤️ by the OptiBid Energy Team**

*Transforming energy trading through innovative technology and AI-powered insights.*