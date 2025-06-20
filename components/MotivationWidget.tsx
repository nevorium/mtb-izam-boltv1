import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Target, TrendingUp } from 'lucide-react-native';

interface MotivationWidgetProps {
  isCompleted: boolean;
  streak: number;
}

export function MotivationWidget({ isCompleted, streak }: MotivationWidgetProps) {
  const getMotivationMessage = () => {
    if (isCompleted) {
      if (streak >= 7) {
        return 'Alhamdulillah! Konsistensi Anda luar biasa!';
      } else if (streak >= 3) {
        return 'Barakallahu fiik! Terus pertahankan!';
      } else {
        return 'Excellent! Murojaah hari ini selesai!';
      }
    } else {
      const hour = new Date().getHours();
      if (hour < 12) {
        return 'Selamat pagi! Semangat murojaah hari ini!';
      } else if (hour < 15) {
        return 'Jangan lupa murojaah hari ini ya!';
      } else if (hour < 18) {
        return 'Masih ada waktu untuk murojaah hari ini!';
      } else {
        return 'Yuk selesaikan murojaah hari ini!';
      }
    }
  };

  return (
    <View style={[
      styles.container,
      isCompleted ? styles.containerCompleted : styles.containerPending
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {isCompleted ? (
            <Zap size={24} color="#FFFFFF" />
          ) : (
            <Target size={24} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.title}>Motivasi Hari Ini</Text>
      </View>
      
      <Text style={styles.message}>{getMotivationMessage()}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <TrendingUp size={16} color="#FFFFFF" />
          <Text style={styles.statText}>{streak} hari berturut</Text>
        </View>
        
        <View style={styles.progressIndicator}>
          <View style={[
            styles.progressBar,
            { width: isCompleted ? '100%' : '0%' }
          ]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  containerCompleted: {
    backgroundColor: '#22C55E',
  },
  containerPending: {
    backgroundColor: '#F59E0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  message: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  progressIndicator: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginLeft: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});