import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  UserGroupIcon, 
  DocumentCheckIcon,
  EyeIcon,
  ServerIcon,
  CloudIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export function EnterpriseSecurityPageContent() {
  return (
    <div className="relative z-10">
      {/* Security Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Badge variant="outline" className="border-green-200 bg-green-50/50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Enterprise Security & Compliance
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Bank-Grade Security
              <br />
              <span className="text-2xl lg:text-4xl text-gray-600 dark:text-gray-300">
                Enterprise Compliance Framework
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Comprehensive security platform with SOC 2 Type II certification, advanced encryption, 
              SSO integration, and complete compliance framework for Fortune 500 energy companies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <DocumentCheckIcon className="w-5 h-5 mr-2" />
                Download Security Docs
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-600">
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Security Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Certifications */}
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Industry-Leading Certifications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform maintains the highest security and compliance standards with 
              regular audits and certifications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {certifications.map((cert, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center">
                    <cert.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{cert.name}</CardTitle>
                  <CardDescription>{cert.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {cert.status}
                  </Badge>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Last audit: {cert.lastAudit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Compliance Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-center mb-8">Comprehensive Compliance Framework</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {complianceFrameworks.map((framework, index) => (
                <div key={index} className="text-center">
                  <div className="mb-4">
                    <framework.icon className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{framework.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{framework.description}</p>
                  <div className="space-y-1">
                    {framework.standards.map((standard, idx) => (
                      <div key={idx} className="text-xs text-green-600 dark:text-green-400">
                        ✓ {standard}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Security Architecture */}
      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Multi-Layer Security Architecture
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Enterprise-grade security with defense-in-depth strategy, comprehensive monitoring, 
              and proactive threat detection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {securityLayers.map((layer, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <layer.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{layer.title}</CardTitle>
                        <CardDescription>{layer.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      Layer {index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {layer.features.map((feature, idx) => (
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

          {/* Security Monitoring Dashboard */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Real-time Security Monitoring</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">All systems operational</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <EyeIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monitoring Coverage</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <MagnifyingGlassIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">&lt; 1min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Threat Detection</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <ServerIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">99.99%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime SLA</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <DocumentTextIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Security Operations</div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Access Control & Identity Management */}
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Advanced Access Control & Identity Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Enterprise-grade identity and access management with SSO integration, 
              role-based access control, and comprehensive audit trails.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {accessControlFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.capabilities.map((capability, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircleIcon className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SSO Integration Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-center mb-8">SSO Integration Partners</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {ssoIntegrations.map((integration, index) => (
                <div key={index} className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                  <integration.icon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                  <div className="font-semibold">{integration.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">SAML 2.0 + OAuth 2.0</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Data Protection & Privacy */}
      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Comprehensive Data Protection
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              End-to-end encryption, data sovereignty compliance, and comprehensive privacy 
              protection for enterprise energy trading data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dataProtectionFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex-shrink-0">
                  <LockClosedIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                  <div className="space-y-1">
                    {feature.specifications.map((spec, idx) => (
                      <div key={idx} className="text-sm text-green-600 dark:text-green-400">
                        ✓ {spec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Security Contact CTA */}
      <SectionWrapper className="bg-gradient-to-br from-green-600 via-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Need Security Assessment?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get a comprehensive security assessment and compliance review for your organization. 
            Our security experts will evaluate your current setup and provide recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <DocumentCheckIcon className="w-5 h-5 mr-2" />
              Request Security Assessment
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Talk to Security Team
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}

// Data arrays
const certifications = [
  {
    name: "SOC 2 Type II",
    description: "Service Organization Control certification for security and availability",
    status: "Current",
    lastAudit: "Oct 2025",
    icon: ShieldCheckIcon
  },
  {
    name: "ISO 27001",
    description: "Information Security Management System certification",
    status: "Certified",
    lastAudit: "Sep 2025",
    icon: DocumentCheckIcon
  },
  {
    name: "GDPR Compliant",
    description: "European data protection regulation compliance",
    status: "Compliant",
    lastAudit: "Nov 2025",
    icon: DocumentTextIcon
  },
  {
    name: "CCPA Compliant",
    description: "California Consumer Privacy Act compliance",
    status: "Compliant",
    lastAudit: "Nov 2025",
    icon: ShieldCheckIcon
  }
]

const complianceFrameworks = [
  {
    name: "Data Protection",
    description: "Comprehensive data privacy and protection standards",
    icon: LockClosedIcon,
    standards: [
      "GDPR Article 32 - Security of processing",
      "CCPA - Consumer data rights",
      "State privacy laws compliance",
      "Data minimization principles"
    ]
  },
  {
    name: "Financial Services",
    description: "Financial industry security and compliance requirements",
    icon: DocumentCheckIcon,
    standards: [
      "NERC CIP Critical Infrastructure Protection",
      "FERC cybersecurity standards",
      "PCI DSS compliance",
      "SOX compliance for financial reporting"
    ]
  },
  {
    name: "Industry Standards",
    description: "Energy sector and technology industry standards",
    icon: ServerIcon,
    standards: [
      "IEC 62443 Industrial automation security",
      "NIST Cybersecurity Framework",
      "ISO 27018 Cloud privacy",
      "NERC cybersecurity standards"
    ]
  }
]

const securityLayers = [
  {
    icon: ShieldCheckIcon,
    title: "Network Security",
    description: "Multi-layer network protection with firewalls and intrusion detection",
    features: [
      "Next-generation firewalls with deep packet inspection",
      "Intrusion Detection and Prevention Systems (IDS/IPS)",
      "DDoS protection and mitigation",
      "Network segmentation and micro-segmentation",
      "Virtual Private Network (VPN) encryption"
    ]
  },
  {
    icon: LockClosedIcon,
    title: "Application Security",
    description: "Secure application development and runtime protection",
    features: [
      "Application Security Testing (SAST/DAST)",
      "Runtime Application Self-Protection (RASP)",
      "API security and rate limiting",
      "SQL injection and XSS protection",
      "Regular penetration testing"
    ]
  },
  {
    icon: UserGroupIcon,
    title: "Identity & Access",
    description: "Comprehensive identity and access management system",
    features: [
      "Multi-factor authentication (MFA)",
      "Single Sign-On (SSO) integration",
      "Role-based access control (RBAC)",
      "Privileged access management (PAM)",
      "Identity governance and administration"
    ]
  },
  {
    icon: ServerIcon,
    title: "Infrastructure Security",
    description: "Secure cloud infrastructure and data protection",
    features: [
      "Zero-trust network architecture",
      "Encrypted data storage and transmission",
      "Secure configuration management",
      "Vulnerability management and patching",
      "Incident response and forensics"
    ]
  }
]

const accessControlFeatures = [
  {
    icon: UserGroupIcon,
    title: "Enterprise SSO",
    description: "Seamless integration with enterprise identity providers",
    capabilities: [
      "SAML 2.0 and OpenID Connect support",
      "Active Directory and LDAP integration",
      "Multi-factor authentication (MFA)",
      "Just-in-time (JIT) user provisioning",
      "Single logout (SLO) capability"
    ]
  },
  {
    icon: DocumentTextIcon,
    title: "Role-Based Access",
    description: "Granular permission management and access control",
    capabilities: [
      "Role-based access control (RBAC)",
      "Attribute-based access control (ABAC)",
      "Dynamic permission assignment",
      "Temporary access and time-based policies",
      "Permission inheritance and delegation"
    ]
  },
  {
    icon: EyeIcon,
    title: "Audit & Monitoring",
    description: "Comprehensive audit trails and security monitoring",
    capabilities: [
      "Real-time security event monitoring",
      "Complete audit logging and retention",
      "User behavior analytics (UBA)",
      "Compliance reporting and dashboards",
      "Automated threat detection and response"
    ]
  }
]

const ssoIntegrations = [
  {
    name: "Azure AD",
    icon: LockClosedIcon
  },
  {
    name: "Okta",
    icon: UserGroupIcon
  },
  {
    name: "Ping Identity",
    icon: ShieldCheckIcon
  },
  {
    name: "Auth0",
    icon: LockOpenIcon
  },
  {
    name: "Google Workspace",
    icon: GlobeAltIcon
  },
  {
    name: "JumpCloud",
    icon: KeyIcon
  },
  {
    name: "OneLogin",
    icon: DocumentTextIcon
  },
  {
    name: "Custom SAML",
    icon: MagnifyingGlassIcon
  }
]

const dataProtectionFeatures = [
  {
    title: "End-to-End Encryption",
    description: "Comprehensive data encryption at rest and in transit",
    specifications: [
      "AES-256 encryption for data at rest",
      "TLS 1.3 for data in transit",
      "Hardware security modules (HSM) for key management",
      "Perfect forward secrecy (PFS)",
      "Zero-knowledge architecture options"
    ]
  },
  {
    title: "Data Sovereignty",
    description: "Regional data residency and compliance options",
    specifications: [
      "US-based data centers for domestic clients",
      "EU-based infrastructure for GDPR compliance",
      "Data localization requirements support",
      "Cross-border data transfer protections",
      "Regional compliance certifications"
    ]
  },
  {
    title: "Privacy Controls",
    description: "Comprehensive privacy protection and user rights",
    specifications: [
      "Right to access and portability",
      "Right to rectification and erasure",
      "Right to restrict processing",
      "Automated data retention policies",
      "Privacy impact assessments"
    ]
  },
  {
    title: "Backup & Recovery",
    description: "Secure data backup and disaster recovery",
    specifications: [
      "Encrypted backups with version control",
      "Geographic distribution of backups",
      "Automated disaster recovery testing",
      "Point-in-time recovery capabilities",
      "Business continuity planning"
    ]
  }
]