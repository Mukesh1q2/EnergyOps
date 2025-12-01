'use client';

import React from 'react';
import { Shield, Lock, Key, Eye, FileCheck, CheckCircle, Server, Database, Network } from 'lucide-react';

export default function SecurityPageContent() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'All data transmitted through OptiBid is encrypted using AES-256 encryption standards, ensuring your trading data remains confidential.',
      status: 'Active'
    },
    {
      icon: Lock,
      title: 'Multi-Factor Authentication',
      description: 'Secure your account with MFA including SMS, email, and authenticator app options for enhanced protection.',
      status: 'Active'
    },
    {
      icon: Key,
      title: 'Role-Based Access Control',
      description: 'Granular permission management ensures users only access data and features relevant to their role.',
      status: 'Active'
    },
    {
      icon: Eye,
      title: 'Audit Logging',
      description: 'Comprehensive activity logs track all system actions for compliance and security monitoring.',
      status: 'Active'
    },
    {
      icon: FileCheck,
      title: 'Compliance Certifications',
      description: 'ISO 27001, SOC 2 Type II, and GDPR compliant infrastructure protecting your sensitive energy trading data.',
      status: 'Certified'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Enterprise-grade cloud infrastructure with redundancy, DDoS protection, and 99.99% uptime SLA.',
      status: 'Active'
    }
  ];

  const complianceStandards = [
    { name: 'ISO 27001', description: 'Information Security Management' },
    { name: 'SOC 2 Type II', description: 'Service Organization Controls' },
    { name: 'GDPR', description: 'Data Protection Regulation' },
    { name: 'CERC Guidelines', description: 'Indian Energy Regulatory Compliance' }
  ];

  const securityMetrics = [
    { label: 'Uptime', value: '99.99%', icon: CheckCircle },
    { label: 'Data Centers', value: '5+', icon: Server },
    { label: 'Encrypted Connections', value: '100%', icon: Lock },
    { label: 'Security Audits/Year', value: '4', icon: FileCheck }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Enterprise-Grade Security</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Security You Can
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Trust
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              OptiBid employs military-grade security measures to protect your energy trading operations,
              ensuring data integrity, confidentiality, and compliance with global standards.
            </p>
          </div>

          {/* Security Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {securityMetrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all"
              >
                <metric.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-slate-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Comprehensive Security Features
          </h2>
          <p className="text-slate-300 text-center mb-12 max-w-2xl mx-auto">
            Multi-layered security architecture designed specifically for energy trading platforms
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Meeting the highest international standards for security and data protection
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceStandards.map((standard, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-blue-500/50 transition-all"
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{standard.name}</h3>
                <p className="text-sm text-slate-400">{standard.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Layered Security Architecture
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8">
              <Network className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Network Layer</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>DDoS Protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Web Application Firewall</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>SSL/TLS Encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>IP Whitelisting</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-8">
              <Database className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Data Layer</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Encrypted at Rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Encrypted in Transit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Regular Backups</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Data Anonymization</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-8">
              <Key className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Access Layer</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Multi-Factor Auth</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Role-Based Access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Session Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Audit Trails</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
            <Shield className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Secure Your Energy Trading?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join leading energy companies who trust OptiBid with their critical trading operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Schedule Security Demo
              </button>
              <button className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500">
                Download Security Whitepaper
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
