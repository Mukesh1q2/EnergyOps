'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface I18nContextType {
  language: string
  setLanguage: (language: string) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation dictionaries
const dictionaries = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      signup: 'Sign Up',
      tryDemo: 'Try Demo',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      contactSales: 'Contact Sales',
      readMore: 'Read More',
    },
    navigation: {
      home: 'Home',
      solutions: 'Solutions',
      features: 'Features',
      pricing: 'Pricing',
      resources: 'Resources',
      about: 'About',
      contact: 'Contact',
      docs: 'Documentation',
      api: 'API',
      status: 'Status',
      privacy: 'Privacy',
      terms: 'Terms',
    },
    hero: {
      title: 'Transform Your Energy Trading with AI-Powered Optimization',
      subtitle: 'Revolutionary enterprise-grade platform for real-time energy analytics, intelligent bidding, and visual knowledge graphs.',
      cta: 'Start Free Trial',
      ctaSecondary: 'Watch Demo',
      features: [
        'Real-time market analytics',
        'AI-powered optimization',
        'Visual knowledge graphs',
        'Enterprise-grade security'
      ]
    },
    solutions: {
      title: 'Tailored Solutions for Every Energy Professional',
      analyst: {
        title: 'Energy Analyst',
        description: 'Advanced analytics and forecasting tools for market insights and trend analysis.',
        features: ['Real-time data analysis', 'Predictive forecasting', 'Custom dashboards', 'Risk assessment']
      },
      trader: {
        title: 'Energy Trader',
        description: 'Intelligent bidding optimization and portfolio management tools.',
        features: ['Automated bidding', 'Portfolio optimization', 'Market intelligence', 'Risk management']
      },
      producer: {
        title: 'Energy Producer',
        description: 'Production optimization and revenue maximization for energy assets.',
        features: ['Production planning', 'Revenue optimization', 'Asset management', 'Performance tracking']
      },
      gridOps: {
        title: 'Grid Operations',
        description: 'Grid stability tools and real-time operational insights.',
        features: ['Grid monitoring', 'Load balancing', 'Emergency response', 'Capacity planning']
      },
      storage: {
        title: 'Energy Storage',
        description: 'Battery optimization and energy storage management solutions.',
        features: ['Storage optimization', 'Charge/discharge scheduling', 'ROI analysis', 'Battery health']
      }
    }
  },
  hi: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      warning: 'चेतावनी',
      info: 'जानकारी',
      close: 'बंद करें',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      save: 'सेव करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      view: 'देखें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      search: 'खोजें',
      filter: 'फिल्टर',
      sort: 'क्रम',
      export: 'निर्यात',
      import: 'आयात',
      refresh: 'रिफ्रेश',
      settings: 'सेटिंग्स',
      profile: 'प्रोफाइल',
      logout: 'लॉगआउट',
      login: 'लॉगिन',
      signup: 'साइन अप',
      tryDemo: 'डेमो आज़माएं',
      getStarted: 'शुरू करें',
      learnMore: 'और जानें',
      contactSales: 'सेल्स से संपर्क करें',
      readMore: 'और पढ़ें',
    },
    navigation: {
      home: 'होम',
      solutions: 'समाधान',
      features: 'फीचर्स',
      pricing: 'कीमत',
      resources: 'संसाधन',
      about: 'हमारे बारे में',
      contact: 'संपर्क',
      docs: 'दस्तावेज़ीकरण',
      api: 'API',
      status: 'स्थिति',
      privacy: 'गोपनीयता',
      terms: 'नियम',
    },
    hero: {
      title: 'AI-संचालित अनुकूलन के साथ अपने ऊर्जा ट्रेडिंग को बदलें',
      subtitle: 'रियल-टाइम ऊर्जा एनालिटिक्स, बुद्धिमान बिडिंग और विज़ुअल नॉलेज ग्राफ़ के लिए क्रांतिकारी एंटरप्राइज़-ग्रेड प्लेटफॉर्म।',
      cta: 'निःशुल्क ट्रायल शुरू करें',
      ctaSecondary: 'डेमो देखें',
      features: [
        'रियल-टाइम मार्केट एनालिटिक्स',
        'AI-संचालित अनुकूलन',
        'विज़ुअल नॉलेज ग्राफ़',
        'एंटरप्राइज़-ग्रेड सुरक्षा'
      ]
    },
    solutions: {
      title: 'हर ऊर्जा पेशेवर के लिए तैयार समाधान',
      analyst: {
        title: 'ऊर्जा विश्लेषक',
        description: 'बाजार अंतर्दृष्टि और रुझान विश्लेषण के लिए उन्नत एनालिटिक्स और पूर्वानुमान उपकरण।',
        features: ['रियल-टाइम डेटा विश्लेषण', 'पूर्वानुमान पूर्वानुमान', 'कस्टम डैशबोर्ड', 'जोखिम मूल्यांकन']
      },
      trader: {
        title: 'ऊर्जा ट्रेडर',
        description: 'बुद्धिमान बिडिंग अनुकूलन और पोर्टफोलियो प्रबंधन उपकरण।',
        features: ['स्वचालित बिडिंग', 'पोर्टफोलियो अनुकूलन', 'बाजार बुद्धिमत्ता', 'जोखिम प्रबंधन']
      },
      producer: {
        title: 'ऊर्जा उत्पादक',
        description: 'ऊर्जा परिसंपत्तियों के लिए उत्पादन अनुकूलन और राजस्व अधिकतमकरण।',
        features: ['उत्पादन योजना', 'राजस्व अनुकूलन', 'परिसंपत्ति प्रबंधन', 'प्रदर्शन ट्रैकिंग']
      },
      gridOps: {
        title: 'ग्रिड संचालन',
        description: 'ग्रिड स्थिरता उपकरण और रियल-टाइम संचालन अंतर्दृष्टि।',
        features: ['ग्रिड मॉनिटरिंग', 'लोड बैलेंसिंग', 'आपातकालीन प्रतिक्रिया', 'क्षमता योजना']
      },
      storage: {
        title: 'ऊर्जा भंडारण',
        description: 'बैटरी अनुकूलन और ऊर्जा भंडारण प्रबंधन समाधान।',
        features: ['भंडारण अनुकूलन', 'चार्ज/डिस्चार्ज शेड्यूलिंग', 'ROI विश्लेषण', 'बैटरी स्वास्थ्य']
      }
    }
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('en')

  // Initialize language from localStorage or browser
  useEffect(() => {
    const storedLanguage = localStorage.getItem('optibid-language')
    if (storedLanguage && ['en', 'hi', 'es', 'fr'].includes(storedLanguage)) {
      setLanguageState(storedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      if (['en', 'hi', 'es', 'fr'].includes(browserLang)) {
        setLanguageState(browserLang)
      }
    }
  }, [])

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage)
    localStorage.setItem('optibid-language', newLanguage)
    
    // Update document language
    document.documentElement.lang = newLanguage
    
    // For RTL languages (future implementation)
    const isRTL = newLanguage === 'ar' || newLanguage === 'he'
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = dictionaries[language as keyof typeof dictionaries] || dictionaries.en
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      // Fallback to English
      let fallbackValue: any = dictionaries.en
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k]
      }
      value = fallbackValue || key
    }
    
    // Replace parameters
    if (params && typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }
    
    return value || key
  }

  const isRTL = false // Will be implemented for RTL languages

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}