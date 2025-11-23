'use client';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import MobileTrading from '@/components/mobile/MobileTrading';
import MobileAIInsights from '@/components/mobile/MobileAIInsights';
import { 
  HomeIcon, 
  ChartBarIcon, 
  BrainIcon, 
  BoltIcon,
  UserIcon,
  BellIcon,
  CogIcon,
  QrCodeIcon
} from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// Mock navigation object for component compatibility
const mockNavigation = {
  navigate: (screen: string) => {
    console.log('Navigating to:', screen);
    // In a real React Native app, this would use navigation methods
  },
  goBack: () => {
    console.log('Going back');
  },
  setOptions: (options: any) => {
    console.log('Setting options:', options);
  }
};

export default function MobileAppPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trading' | 'ai' | 'portfolio' | 'profile'>('dashboard');
  const [showQR, setShowQR] = useState(false);

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

  // Mock data for demonstration
  const appFeatures = [
    {
      id: 'dashboard',
      name: 'Smart Dashboard',
      description: 'AI-powered portfolio overview',
      icon: HomeIcon,
      color: '#10B981',
      active: true
    },
    {
      id: 'trading',
      name: 'AI Trading',
      description: 'Automated trading strategies',
      icon: ChartBarIcon,
      color: '#3B82F6',
      active: true
    },
    {
      id: 'ai',
      name: 'AI Insights',
      description: 'Intelligent market analysis',
      icon: BrainIcon,
      color: '#8B5CF6',
      active: true
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Asset management',
      icon: BoltIcon,
      color: '#F59E0B',
      active: true
    },
    {
      id: 'profile',
      name: 'Profile',
      description: 'Account & settings',
      icon: UserIcon,
      color: '#6B7280',
      active: true
    }
  ];

  const mobileStats = {
    totalUsers: '24.7K',
    activeTraders: '8.2K',
    aiAccuracy: '94.2%',
    avgReturn: '+18.7%'
  };

  const renderActiveComponent = () => {
    const componentProps = { navigation: mockNavigation };
    
    switch (activeTab) {
      case 'dashboard':
        return <MobileDashboard {...componentProps} />;
      case 'trading':
        return <MobileTrading {...componentProps} />;
      case 'ai':
        return <MobileAIInsights {...componentProps} />;
      case 'portfolio':
        return (
          <View style={styles.placeholder}>
            <BoltIcon name="briefcase" size={64} color="#D1D5DB" />
            <Text style={styles.placeholderTitle}>Portfolio Management</Text>
            <Text style={styles.placeholderText}>
              Advanced portfolio analytics coming soon
            </Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.placeholder}>
            <UserIcon name="person" size={64} color="#D1D5DB" />
            <Text style={styles.placeholderTitle}>User Profile</Text>
            <Text style={styles.placeholderText}>
              Account management and settings
            </Text>
          </View>
        );
      default:
        return <MobileDashboard {...componentProps} />;
    }
  };

  if (showQR) {
    return (
      <View style={styles.qrContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.qrGradient}
        >
          <View style={styles.qrContent}>
            <Text style={styles.qrTitle}>Scan to Download</Text>
            <Text style={styles.qrSubtitle}>OptiBid Energy Mobile App</Text>
            
            {/* Mock QR Code */}
            <View style={styles.qrCode}>
              <View style={styles.qrPattern}>
                {[...Array(25)].map((_, i) => (
                  <View key={i} style={[
                    styles.qrModule,
                    { backgroundColor: (i + Math.floor(i/5)) % 3 === 0 ? '#000000' : '#FFFFFF' }
                  ]} />
                ))}
              </View>
            </View>
            
            <Text style={styles.qrUrl}>app.optibid.energy/download</Text>
            
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={() => setShowQR(false)}
            >
              <Text style={styles.qrButtonText}>Back to App</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderActiveComponent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {appFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const isActive = activeTab === feature.id;
          
          return (
            <TouchableOpacity
              key={feature.id}
              style={styles.navItem}
              onPress={() => setActiveTab(feature.id as any)}
            >
              <View style={[
                styles.navIconContainer,
                isActive && { backgroundColor: feature.color + '20' }
              ]}>
                <IconComponent 
                  name={isActive ? feature.icon.name : feature.icon.name + "-outline"} 
                  size={24} 
                  color={isActive ? feature.color : '#6B7280'} 
                />
              </View>
              <Text style={[
                styles.navLabel,
                { color: isActive ? feature.color : '#6B7280' }
              ]}>
                {feature.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Action Button for QR */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowQR(true)}
      >
        <QrCodeIcon name="qr-code" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Demo Mode Banner */}
      <Animated.View 
        style={[
          styles.demoBanner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.demoGradient}
        >
          <View style={styles.demoContent}>
            <BrainIcon name="brain" size={20} color="#FFFFFF" />
            <Text style={styles.demoText}>
              Phase 18: Advanced AI & Mobile Platform
            </Text>
            <Text style={styles.demoSubtext}>
              Full mobile app with AI integration
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingBottom: 80, // Space for bottom navigation
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    paddingBottom: 34, // Safe area for iOS
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  demoBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  demoGradient: {
    borderRadius: 12,
    padding: 12,
  },
  demoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  demoSubtext: {
    color: '#DDD6FE',
    fontSize: 12,
    marginLeft: 8,
  },
  qrContainer: {
    flex: 1,
  },
  qrGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  qrContent: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 18,
    color: '#A7F3D0',
    marginBottom: 40,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPattern: {
    width: 160,
    height: 160,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  qrModule: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  qrUrl: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 32,
  },
  qrButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
});