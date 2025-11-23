'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { 
  SparklesIcon, 
  BrainIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  EyeIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  ArrowPathIcon,
  LightBulbIcon,
  FireIcon
} from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface MobileAIInsightsProps {
  navigation: any;
}

const MobileAIInsights: React.FC<MobileAIInsightsProps> = ({ navigation }) => {
  const [activeInsight, setActiveInsight] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for active insights
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // AI Insights Data
  const aiInsights = [
    {
      id: 1,
      type: 'trading_opportunity',
      title: 'Solar Energy Momentum',
      description: 'Strong bullish signals detected with 87% confidence',
      insight: 'Solar energy shows exceptional momentum with technical indicators suggesting continued upward movement. AI analysis recommends increasing allocation by 5-10%.',
      action: 'Increase Position',
      confidence: 87,
      timeframe: '24-48 hours',
      impact: 'high',
      category: 'Trading',
      reasoning: [
        'RSI momentum above 70 indicates strong buying pressure',
        'Volume surge 234% above average supports breakout',
        'AI sentiment analysis shows 78% positive market bias',
        'Weather forecast favorable for solar generation'
      ],
      expectedReturn: '+8.2%',
      riskLevel: 'Medium',
      recommendation: 'Gradual accumulation over 2-3 days'
    },
    {
      id: 2,
      type: 'risk_warning',
      title: 'Battery Storage Volatility',
      description: 'Increased volatility detected in battery storage sector',
      insight: 'AI risk models indicate elevated volatility in battery storage. Consider hedging or position sizing adjustments.',
      action: 'Review Position',
      confidence: 92,
      timeframe: '3-7 days',
      impact: 'medium',
      category: 'Risk Management',
      reasoning: [
        'VIX levels 40% above 30-day average',
        'Correlation breakdown with market indices',
        'Options flow shows increased protective activity',
        'AI models detect regime change pattern'
      ],
      expectedReturn: 'Neutral',
      riskLevel: 'High',
      recommendation: 'Reduce exposure by 15-20%, add volatility hedges'
    },
    {
      id: 3,
      type: 'portfolio_optimization',
      title: 'Optimal Asset Allocation',
      description: 'AI suggests rebalancing based on updated risk models',
      insight: 'Portfolio optimization algorithms recommend shifting 8% from wind to solar and battery storage based on updated risk-return profiles.',
      action: 'Rebalance Portfolio',
      confidence: 84,
      timeframe: 'Weekly',
      impact: 'high',
      category: 'Portfolio',
      reasoning: [
        'Sharpe ratio improvement potential +0.23',
        'Diversification benefits in renewable energy mix',
        'Risk-adjusted returns favor allocation change',
        'AI clustering shows optimal 35/30/25/10 split'
      ],
      expectedReturn: '+2.1%',
      riskLevel: 'Low',
      recommendation: 'Execute over 2-3 trading sessions'
    },
    {
      id: 4,
      type: 'market_analysis',
      title: 'Renewable Energy Outlook',
      description: 'Long-term AI models project continued sector strength',
      insight: 'Multi-year AI models indicate sustained growth in renewable energy with policy tailwinds and technological advancement supporting the sector.',
      action: 'Strategic Planning',
      confidence: 79,
      timeframe: '6-12 months',
      impact: 'high',
      category: 'Strategy',
      reasoning: [
        'Policy support framework strengthening globally',
        'Technology cost curves declining faster than expected',
        'ESG mandates driving institutional allocation',
        'AI predicts 15.7% CAGR through 2027'
      ],
      expectedReturn: '+18.3%',
      riskLevel: 'Medium',
      recommendation: 'Increase strategic allocation to 45-50%'
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trading_opportunity':
        return <TrendingUpIcon name="trending-up" size={24} color="#10B981" />;
      case 'risk_warning':
        return <ShieldCheckIcon name="shield-alert" size={24} color="#EF4444" />;
      case 'portfolio_optimization':
        return <ChartBarIcon name="analytics" size={24} color="#8B5CF6" />;
      case 'market_analysis':
        return <EyeIcon name="eye" size={24} color="#3B82F6" />;
      default:
        return <BrainIcon name="brain" size={24} color="#6B7280" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const aiMetrics = {
    accuracy: 94.2,
    modelsActive: 12,
    predictions24h: 847,
    insightsGenerated: 23,
    avgConfidence: 87.4
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SparklesIcon name="sparkles" size={24} color="#8B5CF6" />
            <Text style={styles.headerTitle}>AI Insights</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <ArrowPathIcon 
              name={isRefreshing ? "refresh" : "refresh-outline"} 
              size={20} 
              color="#10B981" 
            />
          </TouchableOpacity>
        </View>

        {/* AI Status */}
        <View style={styles.aiStatus}>
          <View style={styles.aiMetric}>
            <Text style={styles.aiMetricValue}>{aiMetrics.accuracy}%</Text>
            <Text style={styles.aiMetricLabel}>Accuracy</Text>
          </View>
          <View style={styles.aiMetric}>
            <Text style={styles.aiMetricValue}>{aiMetrics.modelsActive}</Text>
            <Text style={styles.aiMetricLabel}>Models</Text>
          </View>
          <View style={styles.aiMetric}>
            <Text style={styles.aiMetricValue}>{aiMetrics.predictions24h}</Text>
            <Text style={styles.aiMetricLabel}>24h Predictions</Text>
          </View>
          <View style={styles.aiMetric}>
            <Text style={styles.aiMetricValue}>{aiMetrics.avgConfidence}%</Text>
            <Text style={styles.aiMetricLabel}>Avg Confidence</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Insight Cards */}
        {aiInsights.map((insight, index) => (
          <Animated.View 
            key={insight.id}
            style={[
              styles.insightCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Card Header */}
            <View style={styles.insightHeader}>
              <View style={styles.insightIcon}>
                {getInsightIcon(insight.type)}
              </View>
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightCategory}>{insight.category}</Text>
              </View>
              <View style={[
                styles.impactBadge,
                { backgroundColor: getImpactColor(insight.impact) + '20' }
              ]}>
                <Text style={[
                  styles.impactText,
                  { color: getImpactColor(insight.impact) }
                ]}>
                  {insight.impact.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Confidence Bar */}
            <View style={styles.confidenceSection}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>AI Confidence</Text>
                <Text style={styles.confidenceValue}>{insight.confidence}%</Text>
              </View>
              <View style={styles.confidenceBar}>
                <View style={[
                  styles.confidenceFill,
                  { width: `${insight.confidence}%`, backgroundColor: getImpactColor(insight.impact) }
                ]} />
              </View>
            </View>

            {/* Main Insight */}
            <View style={styles.insightBody}>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              <Text style={styles.insightText}>{insight.insight}</Text>
            </View>

            {/* Reasoning */}
            <View style={styles.reasoningSection}>
              <Text style={styles.reasoningTitle}>AI Reasoning:</Text>
              {insight.reasoning.map((reason, idx) => (
                <View key={idx} style={styles.reasoningItem}>
                  <View style={styles.reasoningDot} />
                  <Text style={styles.reasoningText}>{reason}</Text>
                </View>
              ))}
            </View>

            {/* Action & Meta */}
            <View style={styles.insightFooter}>
              <View style={styles.actionInfo}>
                <View style={styles.actionItem}>
                  <BoltIcon name="flash" size={16} color="#8B5CF6" />
                  <Text style={styles.actionText}>Action: {insight.action}</Text>
                </View>
                <View style={styles.actionItem}>
                  <LightBulbIcon name="bulb" size={16} color="#F59E0B" />
                  <Text style={styles.actionText}>Expected: {insight.expectedReturn}</Text>
                </View>
              </View>
              
              <TouchableOpacity style={[
                styles.actionButton,
                { backgroundColor: getImpactColor(insight.impact) }
              ]}>
                <Text style={styles.actionButtonText}>Take Action</Text>
              </TouchableOpacity>
            </View>

            {/* Meta Information */}
            <View style={styles.metaSection}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Timeframe:</Text>
                <Text style={styles.metaValue}>{insight.timeframe}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Risk Level:</Text>
                <Text style={[
                  styles.metaValue,
                  { color: insight.riskLevel === 'High' ? '#EF4444' : insight.riskLevel === 'Medium' ? '#F59E0B' : '#10B981' }
                ]}>
                  {insight.riskLevel}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <BoltIcon name="flash" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  aiStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiMetric: {
    alignItems: 'center',
  },
  aiMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  aiMetricLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  insightCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  impactBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
  },
  confidenceSection: {
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightBody: {
    marginBottom: 16,
  },
  insightDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  reasoningSection: {
    marginBottom: 16,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reasoningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reasoningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 8,
    marginRight: 12,
  },
  reasoningText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    flex: 1,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 6,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default MobileAIInsights;