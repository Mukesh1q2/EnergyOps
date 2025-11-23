import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BuildingOfficeIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CpuChipIcon,
  GlobeAltIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  TrophyIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export function EnterprisePageContent() {
  return (
    <div className="relative z-10">
      {/* Enterprise Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Badge variant="outline" className="border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                Enterprise Platform
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Enterprise Energy Trading
              <br />
              <span className="text-2xl lg:text-4xl text-gray-600 dark:text-gray-300">
                at Fortune 500 Scale
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your energy trading operations with our enterprise-grade platform. 
              Advanced AI analytics, real-time optimization, and industry-leading security 
              trusted by Fortune 500 energy companies worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Schedule Enterprise Demo
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-600">
                <TrophyIcon className="w-5 h-5 mr-2" />
                View Success Stories
              </Button>
            </div>
            
            {/* Enterprise Trust Indicators */}
            <div className="mt-16">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Trusted by leading energy companies worldwide
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-2xl font-bold text-gray-400">ENERGY CORP</div>
                <div className="text-2xl font-bold text-gray-400">POWERGRID</div>
                <div className="text-2xl font-bold text-gray-400">RENEWABLE INC</div>
                <div className="text-2xl font-bold text-gray-400">TRADING LLC</div>
                <div className="text-2xl font-bold text-gray-400">GRID OPS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Benefits */}
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Energy Companies Choose OptiBid Enterprise
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Purpose-built for enterprise-scale energy trading with industry-leading 
              performance, security, and support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseBenefits.map((benefit, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {benefit.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Enterprise Features Grid */}
      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive platform designed for enterprise energy trading operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {enterpriseFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <StarIcon className="w-3 h-3 text-yellow-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Enterprise Pricing */}
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Enterprise Pricing & Support
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Custom pricing and dedicated support for enterprise deployments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {enterpriseTiers.map((tier, index) => (
              <Card key={index} className={`relative ${index === 1 ? 'ring-2 ring-blue-500' : ''}`}>
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold mb-2">
                    {tier.price}
                    <span className="text-lg font-normal text-gray-500">/year</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${index === 1 ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
                    variant={index === 1 ? 'default' : 'outline'}
                  >
                    {tier.cta}
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Enterprise Contact CTA */}
      <SectionWrapper className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Energy Trading?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join Fortune 500 energy companies using OptiBid Enterprise to optimize their trading operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <RocketLaunchIcon className="w-5 h-5 mr-2" />
              Schedule Enterprise Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Contact Sales Team
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}

// Data arrays
const enterpriseBenefits = [
  {
    icon: ShieldCheckIcon,
    title: "Enterprise Security",
    description: "Bank-grade security with SOC 2 Type II compliance and enterprise SSO.",
    features: [
      "SOC 2 Type II certified",
      "SSO & SAML integration",
      "End-to-end encryption",
      "Role-based access control"
    ]
  },
  {
    icon: CpuChipIcon,
    title: "AI-Powered Optimization",
    description: "Advanced machine learning algorithms for intelligent energy trading.",
    features: [
      "Real-time price optimization",
      "Predictive analytics",
      "Risk assessment models",
      "Automated trading strategies"
    ]
  },
  {
    icon: ChartBarIcon,
    title: "Advanced Analytics",
    description: "Comprehensive analytics and reporting for enterprise decision-making.",
    features: [
      "Real-time dashboards",
      "Custom reporting",
      "Performance metrics",
      "Market intelligence"
    ]
  },
  {
    icon: GlobeAltIcon,
    title: "Global Reach",
    description: "Multi-region deployment with local compliance and data sovereignty.",
    features: [
      "Multi-region deployment",
      "Local compliance",
      "Data sovereignty",
      "24/7 global support"
    ]
  },
  {
    icon: UserGroupIcon,
    title: "Dedicated Support",
    description: "24/7 enterprise support with dedicated account managers.",
    features: [
      "Dedicated account manager",
      "24/7 technical support",
      "Priority feature requests",
      "Custom integrations"
    ]
  },
  {
    icon: RocketLaunchIcon,
    title: "Fast Implementation",
    description: "Rapid deployment with minimal disruption to existing operations.",
    features: [
      "2-week implementation",
      "Migration assistance",
      "Training programs",
      "Change management"
    ]
  }
]

const enterpriseFeatures = [
  {
    icon: ChartBarIcon,
    title: "Advanced Trading Analytics",
    description: "Comprehensive analytics suite for enterprise energy trading.",
    details: [
      "Real-time market data integration",
      "Custom KPI dashboards",
      "Historical trend analysis",
      "Performance benchmarking"
    ]
  },
  {
    icon: CpuChipIcon,
    title: "AI-Powered Decision Engine",
    description: "Machine learning models for intelligent trading decisions.",
    details: [
      "Price prediction algorithms",
      "Risk assessment models",
      "Portfolio optimization",
      "Automated strategy execution"
    ]
  },
  {
    icon: ShieldCheckIcon,
    title: "Enterprise Security & Compliance",
    description: "Bank-grade security with comprehensive compliance framework.",
    details: [
      "SOC 2 Type II certification",
      "GDPR & CCPA compliance",
      "ISO 27001 standards",
      "Regular security audits"
    ]
  },
  {
    icon: GlobeAltIcon,
    title: "Multi-Region Deployment",
    description: "Global infrastructure with local data residency options.",
    details: [
      "AWS multi-region setup",
      "Edge computing capabilities",
      "Local data sovereignty",
      "Regional compliance"
    ]
  }
]

const enterpriseTiers = [
  {
    name: "Growth",
    price: "$50K",
    description: "Perfect for growing energy companies",
    features: [
      "Up to 100 active users",
      "Basic AI analytics",
      "Standard support (business hours)",
      "Monthly reporting",
      "API access",
      "On-premise deployment"
    ],
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Full-scale enterprise platform",
    features: [
      "Unlimited users",
      "Advanced AI models",
      "24/7 dedicated support",
      "Real-time reporting",
      "Custom integrations",
      "Private cloud deployment",
      "Dedicated account manager"
    ],
    cta: "Contact Sales"
  },
  {
    name: "Fortune 500",
    price: "Enterprise",
    description: "Tailored for Fortune 500 companies",
    features: [
      "Everything in Enterprise",
      "Custom AI model training",
      "White-label solutions",
      "On-site training",
      "Compliance consulting",
      "Disaster recovery",
      "SLA guarantees"
    ],
    cta: "Schedule Demo"
  }
]