'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon, 
  BellIcon,
  UserIcon,
  ArrowPathIcon,
  BoltIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  EyeIcon
} from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface MobileDashboardProps {
  navigation: any;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolioValue, setPortfolioValue] = useState('$2,847,293');
  const [dailyChange, setDailyChange] = useState('+$12,847 (+0.45%)');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

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
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const quickActions = [
    {
      title: 'AI Trading',
      subtitle: 'Automated strategies',
      icon: 'trending-up',
      color: '#10B981',
      onPress: () => navigation.navigate('AITrading')
    },
    {
      title: 'Portfolio',
      subtitle: 'View & manage',
      icon: 'briefcase',
      color: '#3B82F6',
      onPress: () => navigation.navigate('Portfolio')
    },
    {
      title: 'Analytics',
      subtitle: 'AI insights',
      icon: 'analytics',
      color: '#8B5CF6',
      onPress: () => navigation.navigate('Analytics')
    },
    {
      title: 'Alerts',
      subtitle: 'Smart notifications',
      icon: 'notifications',
      color: '#F59E0B',
      onPress: () => navigation.navigate('Alerts')
    }
  ];

  const marketData = [
    { symbol: 'SOLAR', price: 42.85, change: '+2.3%', trend: 'up' },
    { symbol: 'WIND', price: 38.92, change: '-0.8%', trend: 'down' },
    { symbol: 'BATT', price: 156.30, change: '+1.2%', trend: 'up' },
    { symbol: 'HYDRO', price: 67.45, change: '+0.3%', trend: 'up' }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>Alex Johnson</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <ArrowPathIcon 
              name={isRefreshing ? "refresh" : "refresh-outline"} 
              size={20} 
              color="#10B981"
            />
          </TouchableOpacity>
        </View>
        
        {/* Portfolio Summary */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Portfolio Value</Text>
          <Text style={styles.portfolioValue}>{portfolioValue}</Text>
          <Text style={[styles.dailyChange, { color: '#10B981' }]}>{dailyChange}</Text>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionCard, { borderLeftColor: action.color }]}
              onPress={action.onPress}
            >
              <View style={styles.quickActionContent}>
                <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
                  <BoltIcon name={action.icon} size={24} color={action.color} />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Market Overview */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Market Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketScroll}>
          {marketData.map((asset, index) => (
            <View key={index} style={styles.marketCard}>
              <Text style={styles.assetSymbol}>{asset.symbol}</Text>
              <Text style={styles.assetPrice}>${asset.price}</Text>
              <Text style={[
                styles.assetChange,
                { color: asset.trend === 'up' ? '#10B981' : '#EF4444' }
              ]}>
                {asset.change}
              </Text>
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* AI Insights */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightsCard}>
          <View style={styles.insightHeader}>
            <SparklesIcon name="sparkles" size={20} color="#8B5CF6" />
            <Text style={styles.insightTitle}>Smart Recommendation</Text>
          </View>
          <Text style={styles.insightText}>
            Increase solar allocation by 5% based on strong momentum signals and favorable policy outlook.
          </Text>
          <TouchableOpacity style={styles.insightButton}>
            <Text style={styles.insightButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'dashboard', icon: 'home', label: 'Home' },
          { key: 'trading', icon: 'trending-up', label: 'Trading' },
          { key: 'portfolio', icon: 'briefcase', label: 'Portfolio' },
          { key: 'ai', icon: 'brain', label: 'AI' },
          { key: 'profile', icon: 'person', label: 'Profile' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <BoltIcon 
              name={activeTab === tab.key ? tab.icon : tab.icon + "-outline"} 
              size={24} 
              color={activeTab === tab.key ? '#10B981' : '#6B7280'} 
            />
            <Text style={[
              styles.navLabel,
              { color: activeTab === tab.key ? '#10B981' : '#6B7280' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  greeting: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  dailyChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  marketScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  marketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  assetPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  insightsCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  insightButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    paddingBottom: 34, // Safe area for iOS
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default MobileDashboard;