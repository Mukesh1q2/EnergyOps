'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ScaleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6"
            >
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Regulatory Compliance
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Compliance</span> & Regulatory Information
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              OptiBid Energy maintains the highest standards of compliance with energy market regulations, 
              financial services laws, and international industry standards to ensure reliable and trustworthy operations.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <strong>Last updated:</strong> December 2, 2025
            </p>
          </div>

          {/* Compliance Overview */}
          <section className="mb-16">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-indigo-900 mb-3 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Our Compliance Commitment
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-indigo-800">
                <div>
                  <h3 className="font-semibold mb-2">Regulatory Framework:</h3>
                  <ul className="space-y-1">
                    <li>• Energy market regulations</li>
                    <li>• Financial services compliance</li>
                    <li>• Data protection laws</li>
                    <li>• Environmental regulations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Industry Standards:</h3>
                  <ul className="space-y-1">
                    <li>• ISO 27001 (Information Security)</li>
                    <li>• SOC 2 Type II (Security)</li>
                    <li>• Energy market standards</li>
                    <li>• Financial reporting standards</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Audit & Verification:</h3>
                  <ul className="space-y-1">
                    <li>• Regular third-party audits</li>
                    <li>• Internal compliance monitoring</li>
                    <li>• Regulatory reporting</li>
                    <li>• Continuous improvement</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Energy Market Compliance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Energy Market Regulations</h2>
            
            <div className="space-y-6">
              {/* Market Operator Rules */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Market Operator Compliance</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  We maintain compliance with all major energy market operators and trading platforms where our clients operate.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Supported Markets:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• PJM Interconnection (USA)</li>
                      <li>• ERCOT (Texas)</li>
                      <li>• ISO-NE (New England)</li>
                      <li>• CAISO (California)</li>
                      <li>• EPEX SPOT (Europe)</li>
                      <li>• Nord Pool (Nordic)</li>
                      <li>• NEM (Australia)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Compliance Areas:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Market participation rules</li>
                      <li>• Grid operation procedures</li>
                      <li>• Renewable energy certificates</li>
                      <li>• Environmental reporting</li>
                      <li>• Emergency operations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* FERC Regulations */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">FERC & Regional Compliance</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Our platform supports compliance with Federal Energy Regulatory Commission (FERC) rules and regional transmission organization (RTO) requirements.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">FERC Order 764 Compliance</h4>
                    <p className="text-gray-600 text-sm">
                      Integrated time-based market participation and coordinated transaction scheduling to align with renewable energy patterns.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Market Surveillance</h4>
                    <p className="text-gray-600 text-sm">
                      Advanced monitoring and reporting systems to detect and prevent market manipulation and ensure fair trading practices.
                    </p>
                  </div>
                </div>
              </div>

              {/* European Energy Regulations */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">European Market Regulations</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Full compliance with European energy market regulations and renewable energy directive requirements.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">EU Regulations:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Clean Energy Package (CEP)</li>
                      <li>• Market Coupling Regulation</li>
                      <li>• Balancing Market Framework</li>
                      <li>• Renewable Energy Directive (RED)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Certification Support:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• GO certificates (Guarantees of Origin)</li>
                      <li>• I-REC certification</li>
                      <li>• Corporate renewable tracking</li>
                      <li>• Carbon disclosure reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Services Compliance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Financial Services Compliance</h2>
            
            <div className="space-y-6">
              {/* Securities Compliance */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <BanknotesIcon className="h-6 w-6 text-yellow-600 mr-2" />
                  <h3 className="text-2xl font-bold text-gray-900">Securities & Derivatives Regulation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  When energy derivatives are traded through our platform, we ensure compliance with applicable securities and derivatives regulations.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Regulatory Bodies:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• CFTC (Commodity Futures Trading Commission)</li>
                      <li>• SEC (Securities and Exchange Commission)</li>
                      <li>• ESMA (European Securities and Markets Authority)</li>
                      <li>• FCA (Financial Conduct Authority - UK)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Compliance Measures:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Position limits and reporting</li>
                      <li>• Large trader reporting</li>
                      <li>• Market surveillance and monitoring</li>
                      <li>• Risk management requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Anti-Money Laundering */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-2xl font-bold text-gray-900">Anti-Money Laundering (AML)</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Comprehensive AML and Counter-Terrorism Financing (CTF) program to prevent illicit financial activities.
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Know Your Customer (KYC)</h4>
                    <p className="text-gray-600 text-sm">
                      Rigorous identity verification and beneficial ownership identification for all platform users.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Transaction Monitoring</h4>
                    <p className="text-gray-600 text-sm">
                      Advanced algorithms monitor trading patterns for suspicious activities and unusual transactions.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Reporting & Compliance</h4>
                    <p className="text-gray-600 text-sm">
                      Automatic reporting to relevant authorities when required, maintaining detailed audit trails.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Protection Compliance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Data Protection & Privacy</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-2" />
                  GDPR Compliance
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Data minimization and purpose limitation</li>
                  <li>• Legal basis for all processing activities</li>
                  <li>• Data subject rights implementation</li>
                  <li>• Privacy by design principles</li>
                  <li>• Data Protection Impact Assessments (DPIA)</li>
                  <li>• International data transfer mechanisms</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
                  CCPA/CPRA Compliance
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• California Consumer Privacy Act compliance</li>
                  <li>• Consumer rights implementation</li>
                  <li>• "Do Not Sell" information provision</li>
                  <li>• Data sharing transparency</li>
                  <li>• Annual privacy policy updates</li>
                  <li>• Consumer request verification processes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Industry Standards */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Industry Standards & Certifications</h2>
            
            <div className="space-y-6">
              {/* ISO Certifications */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">ISO Certifications</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">ISO 27001:2013</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Information Security Management System (ISMS) certification for comprehensive security controls.
                    </p>
                    <div className="text-xs text-green-600 font-medium">
                      ✓ Certified since 2023 | Next audit: June 2025
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">ISO 27017:2015</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Cloud security controls specific to cloud service providers and users.
                    </p>
                    <div className="text-xs text-green-600 font-medium">
                      ✓ Certified since 2024 | Next audit: September 2025
                    </div>
                  </div>
                </div>
              </div>

              {/* SOC 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">SOC 2 Type II</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Service Organization Control 2 (SOC 2) audit report demonstrating security, availability, and confidentiality controls.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Security</h4>
                      <p className="text-gray-600 text-sm">System protection against unauthorized access</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Availability</h4>
                      <p className="text-gray-600 text-sm">System operation and accessibility commitments</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Confidentiality</h4>
                      <p className="text-gray-600 text-sm">Protection of confidential information</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Energy-Specific Standards */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Energy Industry Standards</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">NERC Standards</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• CIP (Critical Infrastructure Protection)</li>
                      <li>• BAL (Balancing and Frequency Control)</li>
                      <li>• TOP (Transmission Operations)</li>
                      <li>• PRC (Protection and Control)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">IEC Standards</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• IEC 61850 (Substation automation)</li>
                      <li>• IEC 62351 (Cyber security)</li>
                      <li>• IEC 61970 (Energy management)</li>
                      <li>• IEC 60870 (Control center communications)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Audit & Verification */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                Audit & Verification Program
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Internal Audits</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Quarterly compliance reviews</li>
                    <li>• Monthly security assessments</li>
                    <li>• Weekly regulatory updates</li>
                    <li>• Continuous monitoring systems</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">External Audits</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Annual SOC 2 Type II audits</li>
                    <li>• ISO 27001 annual surveillance</li>
                    <li>• Third-party penetration testing</li>
                    <li>• Regulatory inspections</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Compliance Monitoring</h3>
                  <p className="text-green-800 text-sm">
                    Our compliance team continuously monitors regulatory changes and updates our policies 
                    and procedures to maintain ongoing compliance with all applicable laws and regulations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance Questions & Certifications</h2>
              <p className="text-gray-600 mb-6">
                For compliance-related inquiries, certification requests, or regulatory information, 
                please contact our compliance team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Contact Compliance Team
                </a>
                <a 
                  href="mailto:compliance@optibid-energy.com" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Email Compliance
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
