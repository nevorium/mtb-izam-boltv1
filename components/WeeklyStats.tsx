import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Calendar } from 'lucide-react-native';

interface WeeklyStatsProps {
  completionRate: number;
}

export function WeeklyStats({ completionRate }: WeeklyStatsProps) {
  const getMotivationMessage = () => {
    if (completionRate >= 80) {
      return 'Excellent! Konsistensi Anda sangat baik!';
    } else if (completionRate >= 60) {
      return 'Good job! Terus tingkatkan konsistensi!';
    } else if (completionRate >= 40) {
      return 'Keep going! Anda bisa lebih baik lagi!';
    } else {
      return 'Mari semangat lagi untuk minggu depan!';
    }
  };

  const getProgressColor = () => {
    if (completionRate >= 80) return '#22C55E';
    if (completionRate >= 60) return '#3B82F6';
    if (completionRate >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <TrendingUp size={20} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Statistik Minggu Ini</Text>
      </View>

      <View style={styles.statsContent}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionRate}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          <Text style={[styles.percentageText, { color: getProgressColor() }]}>
            {completionRate}%
          </Text>
        </View>

        <Text style={styles.motivationText}>{getMotivationMessage()}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {Math.round((completionRate / 100) * 7)} dari 7 hari
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  statsContent: {
    gap: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    minWidth: 50,
    textAlign: 'right',
  },
  motivationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});