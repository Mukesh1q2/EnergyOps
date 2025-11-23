'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  ChartBarIcon,
  ArrowPathIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon
} from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface MobileTradingProps {
  navigation: any;
}

const MobileTrading: React.FC<MobileTradingProps> = ({ navigation }) => {
  const [selectedAsset, setSelectedAsset] = useState('SOLAR');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('42.85');
  const [loading, setLoading] = useState(false);

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

  const assets = [
    { symbol: 'SOLAR', name: 'Solar Energy', price: 42.85, change: '+2.3%', color: '#F59E0B' },
    { symbol: 'WIND', name: 'Wind Energy', price: 38.92, change: '-0.8%', color: '#3B82F6' },
    { symbol: 'BATT', name: 'Battery Storage', price: 156.30, change: '+1.2%', color: '#10B981' },
    { symbol: 'HYDRO', name: 'Hydro Power', price: 67.45, change: '+0.3%', color: '#8B5CF6' }
  ];

  const currentAsset = assets.find(asset => asset.symbol === selectedAsset);

  const aiSignals = {
    SOLAR: {
      signal: 'BUY',
      strength: 87,
      confidence: 92,
      reasoning: 'Strong momentum with bullish technical indicators',
      recommendation: 'Increase position by 10-15%',
      riskLevel: 'Medium',
      timeframe: '24-48 hours'
    },
    WIND: {
      signal: 'HOLD',
      strength: 34,
      confidence: 71,
      reasoning: 'Consolidation phase, waiting for breakout',
      recommendation: 'Maintain current position',
      riskLevel: 'Low',
      timeframe: '3-5 days'
    },
    BATT: {
      signal: 'BUY',
      strength: 76,
      confidence: 88,
      reasoning: 'Oversold conditions with positive divergence',
      recommendation: 'Gradual accumulation',
      riskLevel: 'Medium',
      timeframe: '1-2 weeks'
    },
    HYDRO: {
      signal: 'SELL',
      strength: 65,
      confidence: 79,
      reasoning: 'Resistance levels holding, profit taking expected',
      recommendation: 'Reduce position by 20%',
      riskLevel: 'Medium',
      timeframe: '5-7 days'
    }
  };

  const currentSignal = aiSignals[selectedAsset];

  const handleTrade = async () => {
    if (!amount || (orderType === 'limit' && !price)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Simulate trade execution
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Trade Executed',
        `Successfully ${orderSide.toUpperCase()} ${amount} ${selectedAsset} at $${orderType === 'market' ? currentAsset?.price : price}`,
        [
          { text: 'OK', onPress: () => navigation.navigate('Portfolio') }
        ]
      );
    }, 2000);
  };

  const calculateTotal = () => {
    const tradeAmount = parseFloat(amount) || 0;
    const tradePrice = parseFloat(price) || currentAsset?.price || 0;
    return (tradeAmount * tradePrice).toFixed(2);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Trading</Text>
          <TouchableOpacity>
            <ChartBarIcon name="options" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Asset Selection */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Select Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetScroll}>
            {assets.map((asset) => (
              <TouchableOpacity
                key={asset.symbol}
                style={[
                  styles.assetTab,
                  selectedAsset === asset.symbol && { borderColor: asset.color }
                ]}
                onPress={() => setSelectedAsset(asset.symbol)}
              >
                <Text style={[
                  styles.assetSymbol,
                  selectedAsset === asset.symbol && { color: asset.color }
                ]}>
                  {asset.symbol}
                </Text>
                <Text style={styles.assetName}>{asset.name}</Text>
                <Text style={styles.assetPrice}>${asset.price}</Text>
                <Text style={[
                  styles.assetChange,
                  { color: asset.change.startsWith('+') ? '#10B981' : '#EF4444' }
                ]}>
                  {asset.change}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* AI Analysis Card */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <SparklesIcon name="sparkles" size={20} color="#8B5CF6" />
              <Text style={styles.aiTitle}>AI Signal Analysis</Text>
              <View style={[
                styles.signalBadge,
                { backgroundColor: currentSignal.signal === 'BUY' ? '#10B981' : currentSignal.signal === 'SELL' ? '#EF4444' : '#6B7280' }
              ]}>
                <Text style={styles.signalText}>{currentSignal.signal}</Text>
              </View>
            </View>
            
            <View style={styles.aiMetrics}>
              <View style={styles.aiMetric}>
                <Text style={styles.aiMetricLabel}>Strength</Text>
                <Text style={styles.aiMetricValue}>{currentSignal.strength}%</Text>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${currentSignal.strength}%`, backgroundColor: currentSignal.signal === 'BUY' ? '#10B981' : currentSignal.signal === 'SELL' ? '#EF4444' : '#6B7280' }
                  ]} />
                </View>
              </View>
              
              <View style={styles.aiMetric}>
                <Text style={styles.aiMetricLabel}>Confidence</Text>
                <Text style={styles.aiMetricValue}>{currentSignal.confidence}%</Text>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${currentSignal.confidence}%`, backgroundColor: '#8B5CF6' }
                  ]} />
                </View>
              </View>
            </View>
            
            <Text style={styles.aiReasoning}>{currentSignal.reasoning}</Text>
            
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationLabel}>AI Recommendation:</Text>
              <Text style={styles.recommendationText}>{currentSignal.recommendation}</Text>
            </View>
            
            <View style={styles.aiMeta}>
              <View style={styles.aiMetaItem}>
                <ShieldCheckIcon name="shield-checkmark" size={16} color="#6B7280" />
                <Text style={styles.aiMetaText}>Risk: {currentSignal.riskLevel}</Text>
              </View>
              <View style={styles.aiMetaItem}>
                <ClockIcon name="time" size={16} color="#6B7280" />
                <Text style={styles.aiMetaText}>Timeframe: {currentSignal.timeframe}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Order Form */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Place Order</Text>
          
          {/* Order Type */}
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'market' && styles.activeOrderType
              ]}
              onPress={() => setOrderType('market')}
            >
              <Text style={[
                styles.orderTypeText,
                orderType === 'market' && styles.activeOrderTypeText
              ]}>
                Market
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'limit' && styles.activeOrderType
              ]}
              onPress={() => setOrderType('limit')}
            >
              <Text style={[
                styles.orderTypeText,
                orderType === 'limit' && styles.activeOrderTypeText
              ]}>
                Limit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buy/Sell Buttons */}
          <View style={styles.sideContainer}>
            <TouchableOpacity
              style={[
                styles.sideButton,
                { backgroundColor: orderSide === 'buy' ? '#10B981' : '#374151' }
              ]}
              onPress={() => setOrderSide('buy')}
            >
              <TrendingUpIcon name="trending-up" size={20} color="#FFFFFF" />
              <Text style={styles.sideButtonText}>BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sideButton,
                { backgroundColor: orderSide === 'sell' ? '#EF4444' : '#374151' }
              ]}
              onPress={() => setOrderSide('sell')}
            >
              <TrendingDownIcon name="trending-down" size={20} color="#FFFFFF" />
              <Text style={styles.sideButtonText}>SELL</Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Amount ({selectedAsset})
            </Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.maxButton}>
              <Text style={styles.maxButtonText}>Max</Text>
            </TouchableOpacity>
          </View>

          {/* Price Input (for limit orders) */}
          {orderType === 'limit' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (USD)</Text>
              <TextInput
                style={styles.textInput}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price"
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Total:</Text>
              <Text style={styles.summaryValue}>${calculateTotal()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trading Fee:</Text>
              <Text style={styles.summaryValue}>${(parseFloat(calculateTotal()) * 0.001).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelTotal}>Total:</Text>
              <Text style={styles.summaryValueTotal}>${(parseFloat(calculateTotal()) * 1.001).toFixed(2)}</Text>
            </View>
          </View>

          {/* Execute Button */}
          <TouchableOpacity
            style={[
              styles.executeButton,
              { backgroundColor: orderSide === 'buy' ? '#10B981' : '#EF4444' },
              loading && styles.executeButtonDisabled
            ]}
            onPress={handleTrade}
            disabled={loading}
          >
            <Text style={styles.executeButtonText}>
              {loading ? 'Executing...' : `${orderSide.toUpperCase()} ${selectedAsset}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  },
  backButton: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  assetScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  assetTab: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
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
  assetName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  signalBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  signalText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  aiMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  aiMetric: {
    flex: 1,
  },
  aiMetricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  aiMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  aiReasoning: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  recommendationBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  recommendationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  aiMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiMetaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeOrderType: {
    backgroundColor: '#FFFFFF',
  },
  orderTypeText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
  },
  activeOrderTypeText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  sideContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  sideButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  sideButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  maxButton: {
    position: 'absolute',
    right: 12,
    top: 32,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  maxButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 8,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  executeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  executeButtonDisabled: {
    opacity: 0.6,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MobileTrading;