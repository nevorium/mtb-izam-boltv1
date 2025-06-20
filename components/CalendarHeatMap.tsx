import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMurojaah } from '@/hooks/useMurojaah';

interface CalendarHeatMapProps {
  month: Date;
  data: { [key: string]: { completed: boolean; note: string; timestamp: string } };
}

export function CalendarHeatMap({ month, data }: CalendarHeatMapProps) {
  const { getDayStatus } = useMurojaah();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day: number) => {
    const today = new Date();
    const checkDate = new Date(month.getFullYear(), month.getMonth(), day);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  const getDateObject = (day: number) => {
    return new Date(month.getFullYear(), month.getMonth(), day);
  };

  const getDayStyle = (day: number) => {
    const date = getDateObject(day);
    const status = getDayStatus(date, data);
    const today = isToday(day);

    let backgroundColor = '#E5E7EB'; // default gray
    let borderColor = 'transparent';
    let borderWidth = 1;

    switch (status) {
      case 'completed':
        backgroundColor = '#22C55E'; // green for completed
        break;
      case 'missed':
        backgroundColor = '#EF4444'; // red for missed days
        break;
      case 'before-signup':
        backgroundColor = '#9CA3AF'; // darker gray for before signup
        break;
      case 'future':
        backgroundColor = '#F3F4F6'; // light gray for future
        break;
    }

    if (today) {
      borderColor = '#3B82F6';
      borderWidth = 2;
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth,
    };
  };

  const getTextStyle = (day: number) => {
    const date = getDateObject(day);
    const status = getDayStatus(date, data);
    const today = isToday(day);

    let color = '#6B7280'; // default gray text

    switch (status) {
      case 'completed':
        color = '#FFFFFF'; // white text on green
        break;
      case 'missed':
        color = '#FFFFFF'; // white text on red
        break;
      case 'before-signup':
        color = '#FFFFFF'; // white text on dark gray
        break;
      case 'future':
        color = '#D1D5DB'; // lighter gray for future
        break;
    }

    if (today) {
      color = status === 'completed' || status === 'missed' || status === 'before-signup' 
        ? '#FFFFFF' 
        : '#3B82F6';
    }

    return {
      color,
      fontFamily: today ? 'Inter-Bold' : status === 'completed' ? 'Inter-SemiBold' : 'Inter-Medium',
    };
  };

  const days = getDaysInMonth(month);
  const weekDays = ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <View style={styles.container}>
      {/* Week day headers */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayHeader}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={index} style={styles.emptyDay} />;
          }

          const dayStyle = getDayStyle(day);
          const textStyle = getTextStyle(day);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                dayStyle,
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, textStyle]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
    margin: 2,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
  },
});