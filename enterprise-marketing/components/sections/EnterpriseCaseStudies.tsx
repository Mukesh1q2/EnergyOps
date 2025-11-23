import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrophyIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export function EnterpriseCaseStudies() {
  return (
    <SectionWrapper className="bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 mb-4">
            <TrophyIcon className="w-4 h-4 mr-2" />
            Enterprise Success Stories
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Fortune 500 Companies Trust OptiBid
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real results from enterprise energy trading companies that have transformed 
            their operations with our platform.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {caseStudies.map((study, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {study.company.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{study.company}</CardTitle>
                      <CardDescription className="text-sm">{study.industry}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {study.results.timeframe}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Challenge */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Challenge</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{study.challenge}</p>
                </div>

                {/* Solution */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Solution</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{study.solution}</p>
                </div>

                {/* Results */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Results</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {study.results.metrics.map((metric, idx) => (
                      <div key={idx} className="text-center p-3 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300">
                  "{study.quote}"
                  <footer className="text-sm font-medium mt-2 not-italic">
                    — {study.testimonial.name}, {study.testimonial.title}
                  </footer>
                </blockquote>

                {/* CTA */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" size="sm" className="w-full">
                    Read Full Case Study
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-8">Enterprise Impact Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {impactMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {metric.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  {metric.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Join Fortune 500 Leaders?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            See how our enterprise platform can transform your energy trading operations 
            with AI-powered optimization and advanced analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Schedule Enterprise Demo
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline">
              Download Success Stories
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

// Data for case studies
const caseStudies = [
  {
    company: "Global Energy Corp",
    industry: "Fortune 500 Energy Conglomerate",
    challenge: "Managing complex energy portfolios across 15+ markets with manual processes leading to $50M in annual inefficiencies and delayed decision-making.",
    solution: "Implemented OptiBid Enterprise with AI-powered optimization, real-time market integration, and automated portfolio rebalancing across all trading operations.",
    results: {
      timeframe: "12 months",
      metrics: [
        { value: "23%", label: "Cost Reduction" },
        { value: "$127M", label: "Annual Savings" },
        { value: "85%", label: "Faster Decisions" },
        { value: "99.2%", label: "System Uptime" }
      ]
    },
    quote: "OptiBid transformed our energy trading operations completely. The AI optimization alone has saved us over $127 million in the first year.",
    testimonial: {
      name: "Sarah Johnson",
      title: "VP of Energy Trading"
    }
  },
  {
    company: "PowerGrid Systems",
    industry: "National Grid Operator",
    challenge: "Complex grid balancing across renewable and traditional sources with limited visibility into real-time market conditions and forecasting accuracy below 60%.",
    solution: "Deployed OptiBid Enterprise with advanced forecasting algorithms, real-time grid optimization, and comprehensive market data integration.",
    results: {
      timeframe: "6 months",
      metrics: [
        { value: "34%", label: "Accuracy Boost" },
        { value: "$89M", label: "Cost Savings" },
        { value: "92%", label: "Forecast Accuracy" },
        { value: "45%", label: "Response Time" }
      ]
    },
    quote: "The real-time optimization and forecasting accuracy improvements have revolutionized our grid operations.",
    testimonial: {
      name: "Michael Chen",
      title: "Chief Grid Operations Officer"
    }
  }
]

const impactMetrics = [
  {
    value: "500+",
    label: "Enterprise Clients",
    description: "Fortune 500 companies worldwide"
  },
  {
    value: "$2.3B",
    label: "Cost Savings Generated",
    description: "For our enterprise clients annually"
  },
  {
    value: "47%",
    label: "Average Efficiency Gain",
    description: "Across all implementations"
  },
  {
    value: "99.8%",
    label: "Platform Uptime",
    description: "Enterprise-grade reliability"
  }
]