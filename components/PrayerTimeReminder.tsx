import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Bell } from 'lucide-react-native';

export function PrayerTimeReminder() {
  const getCurrentPrayerTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    const prayerTimes = [
      { name: 'Subuh', time: 5 * 60, next: 'Dzuhur' },
      { name: 'Dzuhur', time: 12 * 60, next: 'Ashar' },
      { name: 'Ashar', time: 15 * 60 + 30, next: 'Maghrib' },
      { name: 'Maghrib', time: 18 * 60, next: 'Isya' },
      { name: 'Isya', time: 19 * 60 + 30, next: 'Subuh' },
    ];

    for (let i = 0; i < prayerTimes.length; i++) {
      const current = prayerTimes[i];
      const next = prayerTimes[(i + 1) % prayerTimes.length];
      
      if (currentTime >= current.time) {
        if (i === prayerTimes.length - 1 || currentTime < next.time) {
          return {
            current: current.name,
            next: current.next,
            timeUntilNext: next.time > current.time 
              ? next.time - currentTime 
              : (24 * 60) - currentTime + next.time
          };
        }
      }
    }
    
    return {
      current: 'Subuh',
      next: 'Dzuhur',
      timeUntilNext: prayerTimes[0].time + (24 * 60) - currentTime
    };
  };

  const prayerInfo = getCurrentPrayerTime();
  const hoursUntilNext = Math.floor(prayerInfo.timeUntilNext / 60);
  const minutesUntilNext = prayerInfo.timeUntilNext % 60;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Clock size={20} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Pengingat Waktu Sholat</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.currentTime}>
          Waktu sholat sekarang: <Text style={styles.highlight}>{prayerInfo.current}</Text>
        </Text>
        <Text style={styles.nextTime}>
          Selanjutnya: {prayerInfo.next} dalam {hoursUntilNext}j {minutesUntilNext}m
        </Text>
      </View>
      
      <View style={styles.reminderNote}>
        <Bell size={16} color="#6B7280" />
        <Text style={styles.reminderText}>
          Manfaatkan waktu setelah sholat untuk murojaah
        </Text>
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
    marginBottom: 16,
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
  content: {
    marginBottom: 16,
  },
  currentTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  highlight: {
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  nextTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  reminderNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
});