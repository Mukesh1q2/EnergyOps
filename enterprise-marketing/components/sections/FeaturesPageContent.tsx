'use client';

import React from 'react';
import { Zap, Brain, TrendingUp, Shield, Database, Cpu, Network, BarChart3, Lock, Globe } from 'lucide-react';

export default function FeaturesPageContent() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Forecasting',
      description: 'Advanced machine learning models predict energy demand, pricing trends, and market conditions with unprecedented accuracy.',
      benefits: ['95%+ accuracy', 'Real-time predictions', 'Adaptive learning']
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Live market data from IEX India and global exchanges with instant insights and actionable intelligence.',
      benefits: ['Sub-second latency', 'Multi-market coverage', 'Custom dashboards']
    },
    {
      icon: Cpu,
      title: 'Quantum Computing',
      description: 'Leverage quantum algorithms for portfolio optimization and complex risk calculations impossible with classical computing.',
      benefits: ['10x faster optimization', 'Complex scenarios', 'Future-ready']
    },
    {
      icon: Database,
      title: 'Blockchain Integration',
      description: 'Transparent, immutable transaction records with smart contract automation for settlements and compliance.',
      benefits: ['Instant settlements', 'Full transparency', 'Automated compliance']
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Military-grade encryption, MFA, role-based access control, and SOC 2 Type II compliance.',
      benefits: ['99.99% uptime', 'Zero breaches', 'ISO 27001 certified']
    },
    {
      icon: Network,
      title: 'IoT & Edge Computing',
      description: 'Connect smart meters, sensors, and edge devices for real-time monitoring and automated responses.',
      benefits: ['1M+ devices', 'Edge processing', 'Real-time control']
    },
    {
      icon: BarChart3,
      title: 'Advanced Reporting',
      description: 'Comprehensive analytics with customizable reports, automated insights, and regulatory compliance documentation.',
      benefits: ['Custom reports', 'Auto-generation', 'Compliance ready']
    },
    {
      icon: Lock,
      title: 'DeFi Integration',
      description: 'Access decentralized finance protocols for energy trading, tokenization, and liquidity pools.',
      benefits: ['24/7 trading', 'Global liquidity', 'Token rewards']
    },
    {
      icon: Globe,
      title: 'Multi-Market Support',
      description: 'Trade across Indian Energy Exchange, global markets, and emerging energy trading platforms.',
      benefits: ['15+ markets', 'Multi-currency', 'Cross-border']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-medium">Complete Feature Suite</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Everything You Need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Dominate Energy Trading
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            From AI-powered forecasting to quantum computing optimization, OptiBid provides
            the most advanced technology stack in the energy trading industry.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all group"
              >
                <div className="p-4 bg-blue-500/10 rounded-lg w-fit mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
            <Zap className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Experience the Future?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join leading energy companies using OptiBid to transform their trading operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Start Free Trial
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500"
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
